from django.contrib import admin
from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MyTokenObtainPairView
from .views import MyTokenRefreshView
from .views import MyTokenBlacklistView
from .views import TweetViewSet
from .views import UserViewSet

router = DefaultRouter()
router.register(r'tweets', TweetViewSet, basename='tweets')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', MyTokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/logout/', MyTokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/', include(router.urls)),
]
