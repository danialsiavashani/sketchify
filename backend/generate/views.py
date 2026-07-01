import uuid
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import GenerateSerializer

DAILY_LIMITS = {
    "free": 3,
    "paid": 50,
}


def get_daily_limit(user):
    return DAILY_LIMITS.get(user.tier, 3)


def reset_quota_if_needed(user):
    """Reset daily counter if it's a new day."""
    today = timezone.localdate()
    if user.last_generation_reset < today:
        user.generations_used_today = 0
        user.last_generation_reset = today
        user.save(update_fields=["generations_used_today", "last_generation_reset"])


class GenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        # Reset quota if it's a new day
        reset_quota_if_needed(user)

        # Check quota
        daily_limit = get_daily_limit(user)
        if user.generations_used_today >= daily_limit:
            return Response(
                {
                    "detail": f"Daily limit of {daily_limit} generations reached. Upgrade to Pro for more.",
                    "generations_used": user.generations_used_today,
                    "daily_limit": daily_limit,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # Validate image
        image = request.FILES.get("image")
        if not image:
            return Response(
                {"detail": "No image provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate and extract CV params via serializer
        params_serializer = GenerateSerializer(data=request.data)
        if not params_serializer.is_valid():
            return Response(
                params_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )
        params = params_serializer.validated_data
        blur_amount         = params["blur_amount"]
        edge_threshold_low  = params["edge_threshold_low"]
        edge_threshold_high = params["edge_threshold_high"]
        line_thickness      = params["line_thickness"]

        # Forward to cv-service
        try:
            cv_response = requests.post(
                f"{settings.CV_SERVICE_URL}/process",
                files={"image": (image.name, image.read(), image.content_type)},
                data={
                    "blur_amount": blur_amount,
                    "edge_threshold_low": edge_threshold_low,
                    "edge_threshold_high": edge_threshold_high,
                    "line_thickness": line_thickness,
                },
                timeout=30,
            )
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            return Response(
                {"detail": "Image processing service unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if cv_response.status_code != 200:
            return Response(
                {"detail": "Image processing failed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save result image to media/results/
        filename = f"results/{uuid.uuid4()}.png"
        saved_path = default_storage.save(filename, ContentFile(cv_response.content))

        # Build the full URL to the saved image
        result_url = request.build_absolute_uri(
            settings.MEDIA_URL + saved_path
        )

        # Increment quota
        user.generations_used_today += 1
        user.save(update_fields=["generations_used_today"])

        return Response({
            "result_url": result_url,
            "generations_used": user.generations_used_today,
            "daily_limit": daily_limit,
        })


class QuotaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        reset_quota_if_needed(user)
        daily_limit = get_daily_limit(user)

        return Response({
            "generations_used": user.generations_used_today,
            "daily_limit": daily_limit,
            "tier": user.tier,
        })

class PreviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Validate image
        image = request.FILES.get("image")
        if not image:
            return Response(
                {"detail": "No image provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate CV params
        params_serializer = GenerateSerializer(data=request.data)
        if not params_serializer.is_valid():
            return Response(
                params_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )
        params = params_serializer.validated_data

        # Forward to cv-service with preview=true
        try:
            cv_response = requests.post(
                f"{settings.CV_SERVICE_URL}/process",
                files={"image": (image.name, image.read(), image.content_type)},
                data={
                    "blur_amount": params["blur_amount"],
                    "edge_threshold_low": params["edge_threshold_low"],
                    "edge_threshold_high": params["edge_threshold_high"],
                    "line_thickness": params["line_thickness"],
                    "preview": "true",
                },
                timeout=30,
            )
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            return Response(
                {"detail": "Image processing service unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if cv_response.status_code != 200:
            return Response(
                {"detail": "Image processing failed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Return the image directly as binary — no saving, no quota
        from django.http import HttpResponse
        return HttpResponse(
            cv_response.content,
            content_type="image/png",
        )