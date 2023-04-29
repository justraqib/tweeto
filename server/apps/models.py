from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    about = models.CharField(max_length=128, default="", blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=128, default="", blank=True)

    def __str__(self):
        return self.username


class Tweet(models.Model):
    created = models.DateTimeField(auto_now=True)
    body = models.CharField(max_length=260, blank=False)
    user = models.ForeignKey(
        User, related_name="tweets", on_delete=models.CASCADE
    )

    def __str__(self) -> str:
        return f"<{self.__class__.__name__}: {self.id}>"
