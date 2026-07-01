from django.urls import path
from .views import GenerateView, QuotaView, PreviewView

urlpatterns = [
    path("generate/", GenerateView.as_view(), name="generate"),
    path("preview/", PreviewView.as_view(), name="preview"),
    path("quota/", QuotaView.as_view(), name="quota"),
]