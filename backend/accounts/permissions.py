from rest_framework.permissions import BasePermission


def has_role(user, *roles):
    return bool(user and user.is_authenticated and (user.role in roles or user.is_superuser))


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "admin")


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "employee", "admin")


class IsKitchen(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "kitchen", "admin")


class IsReception(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "reception", "admin")
