from rest_framework import serializers


class GenerateSerializer(serializers.Serializer):
    blur_amount = serializers.IntegerField(
        default=5,
        min_value=1,
        max_value=10,
    )
    edge_threshold_low = serializers.IntegerField(
        default=50,
        min_value=1,
        max_value=150,
    )
    edge_threshold_high = serializers.IntegerField(
    default=150,
    min_value=1,
    max_value=500,  # was 300, needs to accommodate edge_threshold_low * 3 up to 150*3=450
    )
    line_thickness = serializers.IntegerField(
        default=1,
        min_value=1,
        max_value=5,
    )