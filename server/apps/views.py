import datetime
from django.conf import settings

from rest_framework import mixins
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

from .filters import TweetFilter
from .models import TweetLike
from .models import Tweet
from .models import User
from .models import UserFollow
from .serializers import MyTokenObtainPairSerializer
from .serializers import MyTokenRefreshSerializer
from .serializers import TweetSerializer
from .serializers import TweetLikeSerializer
from .serializers import UserSerializer
from .serializers import UserFollowSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(request, *args, **kwargs):
        response = super().post(*args, **kwargs)
        refresh_token = response.data.pop("refresh")
        refresh_expiry_epoch = response.data.pop("refresh_expiry")
        refresh_expiry = datetime.datetime.utcfromtimestamp(refresh_expiry_epoch)
        response.set_cookie(
            settings.JWT_COOKIE_NAME,
            refresh_token,
            expires=refresh_expiry,
            secure=True,
            httponly=True,
            samesite=None,
        )
        return response


class MyTokenRefreshView(TokenRefreshView):
    serializer_class = MyTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        request.data["refresh"] = request.COOKIES.get(settings.JWT_COOKIE_NAME)
        return super().post(request, *args, **kwargs)


class MyTokenBlacklistView(TokenBlacklistView):
    def post(self, request, *args, **kwargs):
        request.data["refresh"] = request.COOKIES.get(settings.JWT_COOKIE_NAME)
        response = super().post(request, *args, **kwargs)
        response.delete_cookie(settings.JWT_COOKIE_NAME)
        return response


class TweetViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Tweet.objects.all()
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = TweetFilter
    pagination_class = PageNumberPagination

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserViewSet(
    mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = "username"

    @action(detail=False, permission_classes=[permissions.IsAuthenticated])
    def me(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class UserFollowViewSet(
    mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet
):
    queryset = UserFollow.objects.all()
    serializer_class = UserFollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        request.data["user"] = request.user.pk
        return super().create(request, *args, **kwargs)


class TweetLikeViewSet(
    mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet
):
    queryset = TweetLike.objects.all()
    serializer_class = TweetLikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        request.data["user"] = request.user.pk
        return super().create(request, *args, **kwargs)
