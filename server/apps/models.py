from django.db import models


class Tweet(models.Model):
    created = models.DateTimeField(auto_now=True)
    body = models.CharField(max_length=260, blank=False)
    user = models.ForeignKey('auth.User', related_name='tweets', on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"<{self.__class__.__name__}: {self.id}>"
