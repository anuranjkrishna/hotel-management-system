from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, MeView, UserListCreateView, UserDetailView

urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("users/", UserListCreateView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
]
