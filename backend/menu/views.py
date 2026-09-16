from rest_framework import viewsets, permissions
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer
from accounts.permissions import IsAdminRole


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return bool(request.user and request.user.is_authenticated and (request.user.role == "admin" or request.user.is_superuser))


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related("category").all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrReadOnly]
