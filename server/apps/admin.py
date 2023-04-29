from django.contrib import admin
from .models import Tweet

class TweetAdmin(admin.ModelAdmin):
    list_display = ["__str__", "body", "user", "created"]

admin.site.register(Tweet, TweetAdmin)
