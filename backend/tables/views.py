from rest_framework import viewsets, permissions
from .models import DiningTable
from .serializers import DiningTableSerializer


class DiningTableViewSet(viewsets.ModelViewSet):
    queryset = DiningTable.objects.all()
    serializer_class = DiningTableSerializer
    permission_classes = [permissions.IsAuthenticated]
