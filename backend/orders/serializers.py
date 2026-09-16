from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from menu.models import MenuItem
from tables.models import DiningTable


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "menu_item", "item_name", "quantity", "price_at_order", "notes", "subtotal"]
        read_only_fields = ["item_name", "price_at_order"]


class OrderItemInputSerializer(serializers.Serializer):
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all())
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source="table.number", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "table", "table_number", "created_by", "created_by_name",
            "status", "payment_method", "is_paid", "notes",
            "created_at", "updated_at", "items", "total",
        ]
        read_only_fields = ["created_by", "status", "payment_method", "is_paid"]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True)

    class Meta:
        model = Order
        fields = ["id", "table", "notes", "items"]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = self.context["request"]
        order = Order.objects.create(created_by=request.user, **validated_data)
        for item in items_data:
            menu_item = item["menu_item"]
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                item_name=menu_item.name,
                quantity=item["quantity"],
                price_at_order=menu_item.price,
                notes=item.get("notes", ""),
            )
        table = order.table
        table.is_occupied = True
        table.save(update_fields=["is_occupied"])
        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]


class OrderPaymentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["payment_method", "is_paid"]
