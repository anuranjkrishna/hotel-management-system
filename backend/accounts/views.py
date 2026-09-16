from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import MyTokenObtainPairSerializer, UserSerializer, CreateUserSerializer
from .permissions import IsAdminRole


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("username")
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateUserSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
