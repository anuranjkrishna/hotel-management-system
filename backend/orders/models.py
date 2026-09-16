from django.db import models
from django.conf import settings
from tables.models import DiningTable
from menu.models import MenuItem


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready"
        SERVED = "served", "Served"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        CARD = "card", "Card"
        QR = "qr", "QR / UPI"

    table = models.ForeignKey(DiningTable, related_name="orders", on_delete=models.PROTECT)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders_taken", on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - Table {self.table.number} ({self.status})"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, related_name="+", on_delete=models.PROTECT)
    item_name = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField(default=1)
    price_at_order = models.DecimalField(max_digits=8, decimal_places=2)
    notes = models.CharField(max_length=255, blank=True)

    @property
    def subtotal(self):
        return self.quantity * self.price_at_order

    def __str__(self):
        return f"{self.quantity} x {self.item_name}"
