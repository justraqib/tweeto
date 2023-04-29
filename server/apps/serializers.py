from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)

from .models import Tweet
from .models import User
from .models import UserFollow
from .models import TweetLike


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["refresh_expiry"] = refresh.payload["exp"]
        data["access_expiry"] = refresh.access_token.payload["exp"]
        return data


class MyTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh_token = self.token_class(attrs["refresh"])
        data = super().validate(attrs)
        data["access_expiry"] = refresh_token.access_token.payload["exp"]
        return data


class UserSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source="get_full_name")
    followers_count = serializers.ReadOnlyField(source="get_followers_count")
    following_count = serializers.ReadOnlyField(source="get_following_count")
    current_user_follow_id = serializers.SerializerMethodField()

    def get_current_user_follow_id(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        follow_obj = UserFollow.objects.filter(user=request.user, follows=obj).first()
        return follow_obj.id if follow_obj else 0

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "name",
            "email",
            "about",
            "location",
            "timezone",
            "avatar_url",
            "date_joined",
            "username",
            "password",
            "followers_count",
            "following_count",
            "current_user_follow_id",
        ]
        extra_kwargs = {
            "first_name": {"write_only": True},
            "last_name": {"write_only": True},
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "password" in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        return super().update(instance, validated_data)


class TweetSerializer(serializers.ModelSerializer):
    current_user_like_id = serializers.SerializerMethodField()
    likes_count = serializers.ReadOnlyField(source="get_likes_count")
    replies_count = serializers.ReadOnlyField(source="get_replies_count")
    user = UserSerializer(read_only=True)

    def get_current_user_like_id(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        like_obj = TweetLike.objects.filter(user=request.user, tweet=obj).first()
        return like_obj.id if like_obj else 0

    class Meta:
        model = Tweet
        fields = [
            "id",
            "created",
            "body",
            "likes_count",
            "replies_count",
            "current_user_like_id",
            "user",
            "parent",
        ]


class UserFollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFollow
        fields = ["id", "user", "follows"]


class TweetLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TweetLike
        fields = ["id", "created", "user", "tweet"]
