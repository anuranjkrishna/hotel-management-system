from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(Category, related_name="items", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_available = models.BooleanField(default=True)
    is_veg = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
