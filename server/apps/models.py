from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    about = models.CharField(max_length=128, default="", blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=128, default="", blank=True)
    following = models.ManyToManyField(
        "self",
        through="UserFollows",
        through_fields=("user", "follows"),
    )

    def __str__(self):
        return self.username

    def get_followers_count(self):
        return UserFollows.objects.filter(follows=self).count()

    def get_following_count(self):
        return UserFollows.objects.filter(user=self).count()


class UserFollows(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    follows = models.ForeignKey(User, related_name="followed_by", on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.__class__.__name__}: {self.user} --> {self.follows}"

    class Meta:
        verbose_name_plural = "user follows"


class Tweet(models.Model):
    created = models.DateTimeField(auto_now=True)
    body = models.CharField(max_length=260, blank=False)
    user = models.ForeignKey(User, related_name="tweets", on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"<{self.__class__.__name__}: {self.id}>"
