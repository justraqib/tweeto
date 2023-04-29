# Generated by Django 4.1.4 on 2023-01-10 21:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('apps', '0002_user_timezone'),
    ]

    operations = [
        migrations.CreateModel(
            name='TweetLike',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now=True)),
                ('tweet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='apps.tweet')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'tweet')},
            },
        ),
        migrations.AddField(
            model_name='tweet',
            name='likes',
            field=models.ManyToManyField(related_name='liked_tweets', through='apps.TweetLike', to=settings.AUTH_USER_MODEL),
        ),
    ]