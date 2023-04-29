import datetime
from django.conf import settings

from rest_framework import mixins
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import MyTokenObtainPairSerializer
from .serializers import MyTokenRefreshSerializer
from .serializers import UserSerializer


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
            samesite=None
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


class UserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = UserSerializer

    @action(detail=False, permission_classes=[permissions.IsAuthenticated])
    def me(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)
