from django_filters import rest_framework as filters
from .models import Tweet


class TweetFilter(filters.FilterSet):
    order_by = filters.OrderingFilter(fields=["created"])

    class Meta:
        model = Tweet
        fields = ["user__username", "user__followed_by__user__username"]
