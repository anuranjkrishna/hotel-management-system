from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Order
from .serializers import (
    OrderSerializer, OrderCreateSerializer,
    OrderStatusUpdateSerializer, OrderPaymentUpdateSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("table", "created_by").prefetch_related("items")
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = getattr(user, "role", None)
        params = self.request.query_params

        if role == "kitchen":
            qs = qs.filter(status__in=["pending", "preparing", "ready"])
        elif role == "reception":
            qs = qs.filter(status__in=["ready", "served", "paid"])
        elif role == "employee":
            qs = qs.filter(created_by=user)
        # admin / superuser: no extra filter, sees everything

        status_param = params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Orders that aren't fully closed out yet - useful for an at-a-glance count."""
        qs = self.get_queryset().exclude(status__in=["paid", "cancelled"])
        serializer = OrderSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def set_status(self, request, pk=None):
        order = self.get_object()
        role = getattr(request.user, "role", None)

        allowed_transitions = {
            "kitchen": {"pending": "preparing", "preparing": "ready"},
            "reception": {"ready": "served"},
            "employee": {"ready": "served"},
        }
        if role in ("admin",) or request.user.is_superuser:
            new_status = request.data.get("status")
        else:
            new_status = allowed_transitions.get(role, {}).get(order.status)
            requested = request.data.get("status")
            if requested and requested != new_status:
                return Response(
                    {"detail": f"{role} cannot move an order from {order.status} to {requested}."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if not new_status:
            return Response({"detail": "No valid status transition available."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderStatusUpdateSerializer(order, data={"status": new_status}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["patch"])
    def set_payment(self, request, pk=None):
        order = self.get_object()
        role = getattr(request.user, "role", None)
        if role not in ("reception", "admin") and not request.user.is_superuser:
            return Response({"detail": "Only reception can record payment."}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrderPaymentUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if order.is_paid:
            order.status = Order.Status.PAID
            order.save(update_fields=["status"])
            table = order.table
            if not table.orders.exclude(status__in=["paid", "cancelled"]).exclude(pk=order.pk).exists():
                table.is_occupied = False
                table.save(update_fields=["is_occupied"])

        return Response(OrderSerializer(order).data)
