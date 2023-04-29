import datetime
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from .serializers import MyTokenObtainPairSerializer, MyTokenRefreshSerializer


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


@api_view(['GET'])
def current_user_details(request):
    user = request.user
    if user.is_authenticated:
        return Response({
            "id": user.id,
            "username": user.username,
            "name": user.get_full_name(),
            "email": user.email,
        })
    return Response(
        {"error": "Unauthenticated!"},
        status=status.HTTP_401_UNAUTHORIZED
    )
