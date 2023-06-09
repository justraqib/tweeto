from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from .constants import TIMEZONES


class User(AbstractUser):
    about = models.CharField(max_length=128, default="", blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=128, default="", blank=True)
    timezone = models.CharField(
        max_length=64, choices=TIMEZONES, default=settings.TIME_ZONE
    )
    following = models.ManyToManyField(
        "self",
        through="UserFollow",
        through_fields=("user", "follows"),
    )

    def __str__(self):
        return self.username

    def get_followers_count(self):
        return UserFollow.objects.filter(follows=self).count() - 1

    def get_following_count(self):
        return UserFollow.objects.filter(user=self).count() - 1

    def save(self, *args, **kwargs):
        is_created = self.id is None
        result = super().save(*args, **kwargs)
        if is_created:
            UserFollow.objects.create(user=self, follows=self)
        return result


class UserFollow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    follows = models.ForeignKey(
        User, related_name="followed_by", on_delete=models.CASCADE
    )

    def __str__(self) -> str:
        return f"{self.user} follows {self.follows}"

    class Meta:
        unique_together = (("user", "follows"),)


class Tweet(models.Model):
    created = models.DateTimeField(auto_now=True)
    body = models.CharField(max_length=260, blank=False)
    user = models.ForeignKey(User, related_name="tweets", on_delete=models.CASCADE)
    likes = models.ManyToManyField(
        User, through="TweetLike", related_name="liked_tweets"
    )
    parent = models.ForeignKey("self", related_name="replies", on_delete=models.CASCADE, blank=True, null=True, default=None)

    def __str__(self) -> str:
        return f"{self.body[:32]}"

    def get_likes_count(self):
        return self.likes.count()

    def get_replies_count(self):
        return self.replies.count()


class TweetLike(models.Model):
    created = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE)

    class Meta:
        unique_together = (("user", "tweet"),)
