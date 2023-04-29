from django_filters import rest_framework as filters
from django.db.models import Q
from .models import Tweet, User


class TweetFilter(filters.FilterSet):
    order_by = filters.OrderingFilter(fields=["created"])

    class Meta:
        model = Tweet
        fields = {
            "user__username": ["exact"],
            "user__followed_by__user__username": ["exact"],
            "parent": ["exact", "isnull"],
        }


class UserFilter(filters.FilterSet):
    q = filters.CharFilter(method="search_by_query")
    username__not = filters.CharFilter(field_name='username', exclude=True)

    def search_by_query(self, queryset, _, value):
        return queryset.filter(
            Q(username__istartswith=value)
            | Q(email__istartswith=value)
            | Q(first_name__istartswith=value)
        )

    class Meta:
        model = User
        fields = ["q"]
