from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Create or update demo quick-login users (customer and host)."

    def _reset_user_pk_sequence(self) -> None:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT setval(
                    pg_get_serial_sequence('auth_user', 'id'),
                    GREATEST((SELECT COALESCE(MAX(id), 1) FROM auth_user), 1),
                    true
                )
                """
            )

    def _upsert_user(self, email: str, password: str, first_name: str, last_name: str) -> User:
        user = User.objects.filter(username=email).first() or User.objects.filter(email=email).first()

        if user is None:
            self._reset_user_pk_sequence()
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

        user.username = email
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.is_active = True
        user.set_password(password)
        user.save()
        return user

    def handle(self, *args, **options):
        host_group, _ = Group.objects.get_or_create(name="Host")
        customer_group, _ = Group.objects.get_or_create(name="Customer")

        customer = self._upsert_user(
            email="john.doe@example.com",
            password="Password123!",
            first_name="John",
            last_name="Doe",
        )
        customer.groups.add(customer_group)

        host = self._upsert_user(
            email="hostdemo@getaroom.com",
            password="HostDemo123!",
            first_name="Host",
            last_name="Demo Company",
        )
        host.groups.add(host_group)

        self.stdout.write(self.style.SUCCESS("Demo users seeded/updated successfully."))
