from django.db import models


class DiningTable(models.Model):
    number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField(default=4)
    is_occupied = models.BooleanField(default=False)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"Table {self.number}"
