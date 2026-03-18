from django.db import models
from django.contrib.auth.models import User #django's built in user model

## idk co to, było tu
class Message(models.Model):
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


class Venue(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name


class EventInstance(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    time = models.DateTimeField()

    def __str__(self):
        return f"{self.event.name} at {self.time}"


class Seat(models.Model):
    eventinstance = models.ForeignKey(EventInstance, on_delete=models.CASCADE)
    row_number = models.IntegerField()
    seat_number = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ("eventinstance", "row_number", "seat_number")

    def __str__(self):
        return f"Row {self.row_number} Seat {self.seat_number}"


class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
    ]

    eventinstance = models.ForeignKey(EventInstance, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"Order {self.id}"


class OrderSeat(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("seat", "order")

    def __str__(self):
        return f"Order {self.order.id} - Seat {self.seat.id}"


class Payment(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    stripe_session_id = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"Payment for Order {self.order.id}"