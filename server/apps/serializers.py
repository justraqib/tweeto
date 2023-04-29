from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
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


class UserSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source="get_full_name")

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'name', 'email', 'username', 'password']
        extra_kwargs = {
            'first_name': {'write_only': True},
            'last_name': {'write_only': True},
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
