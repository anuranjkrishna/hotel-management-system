from django.core.management.base import BaseCommand
from accounts.models import User
from menu.models import Category, MenuItem
from tables.models import DiningTable


class Command(BaseCommand):
    help = "Seed demo users, tables and menu items for the hotel order management system."

    def handle(self, *args, **options):
        # --- Users ---
        demo_users = [
            ("admin", "admin123", "admin", "Hotel", "Admin", True),
            ("employee1", "employee123", "employee", "Ravi", "Kumar", False),
            ("kitchen1", "kitchen123", "kitchen", "Suresh", "Chef", False),
            ("reception1", "reception123", "reception", "Anjali", "Nair", False),
        ]
        for username, password, role, first, last, is_super in demo_users:
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(role=role, first_name=first, last_name=last,
                               is_staff=True, is_superuser=is_super),
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user {username} ({role}) / password: {password}"))
            else:
                self.stdout.write(f"User {username} already exists, skipping.")

        # --- Tables ---
        for n in range(1, 9):
            DiningTable.objects.get_or_create(number=n, defaults={"capacity": 4})
        self.stdout.write(self.style.SUCCESS("Ensured 8 dining tables exist."))

        # --- Menu ---
        menu_data = {
            "Starters": [
                ("Chicken 65", 220, True, False),
                ("Veg Spring Rolls", 160, True, True),
                ("Paneer Tikka", 210, True, True),
                ("Fish Fry", 260, True, False),
            ],
            "Main Course": [
                ("Chicken Biryani", 260, True, False),
                ("Veg Biryani", 190, True, True),
                ("Kerala Parotta (2 pcs) + Beef Curry", 240, True, False),
                ("Butter Chicken", 280, True, False),
                ("Dal Tadka", 150, True, True),
                ("Ghee Rice", 130, True, True),
            ],
            "Beverages": [
                ("Fresh Lime Soda", 60, True, True),
                ("Masala Chai", 30, True, True),
                ("Cold Coffee", 90, True, True),
                ("Mineral Water", 20, True, True),
            ],
            "Desserts": [
                ("Gulab Jamun (2 pcs)", 70, True, True),
                ("Ice Cream Scoop", 60, True, True),
            ],
        }
        for order, (cat_name, items) in enumerate(menu_data.items()):
            category, _ = Category.objects.get_or_create(name=cat_name, defaults={"order": order})
            for name, price, avail, veg in items:
                MenuItem.objects.get_or_create(
                    category=category, name=name,
                    defaults={"price": price, "is_available": avail, "is_veg": veg},
                )
        self.stdout.write(self.style.SUCCESS("Seeded menu categories and items."))
        self.stdout.write(self.style.SUCCESS("\nDemo login credentials:"))
        for username, password, role, *_ in demo_users:
            self.stdout.write(f"  {role:10s} -> username: {username:12s} password: {password}")
