from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["refresh_expiry"] = refresh.payload['exp']
        data["access_expiry"] = refresh.access_token.payload['exp']
        return data


class MyTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh_token = self.token_class(attrs["refresh"])
        data = super().validate(attrs)
        data["access_expiry"] = refresh_token.access_token.payload['exp']
        return data
