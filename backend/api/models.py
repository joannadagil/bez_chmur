from django.db import models
from django.contrib.auth.models import User, Group

class Venue(models.Model):
    """Physical venue layout used to generate seats and host event instances."""

    name = models.CharField(max_length=255)
    rows = models.IntegerField()
    seats_per_row = models.IntegerField()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Persist the venue and create its default seat grid on first save."""

        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            for r in range(1, self.rows + 1):
                for s in range(1, self.seats_per_row + 1):
                    Seat.objects.create(venue=self, row=r, number=s)

class EventCategory(models.Model):
    """Category used to group events, such as cinema, theatre, or lecture."""

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Event(models.Model):
    """Reusable event definition shared by one or more scheduled showings."""

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE, null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.name

class EventInstance(models.Model):
    """Scheduled occurrence of an event at a specific venue and time."""

    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_event_instances', null=True, blank=True)
    time = models.DateTimeField()
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.event.name} at {self.time}"

class SeatCategory(models.Model):
    """Pricing category that can be assigned to seats for an event."""

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Seat(models.Model):
    """Single seat in a venue layout."""

    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    row = models.IntegerField()
    number = models.IntegerField()
    if_exist = models.BooleanField(default=True)

    class Meta:
        unique_together = ("venue", "row", "number")

    def __str__(self):
        return f"Row {self.row} Seat {self.number}"

class EventSeat(models.Model):
    """Seat assignment for a specific event instance and price category."""

    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    seat_category = models.ForeignKey(SeatCategory, on_delete=models.CASCADE)
    event_instance = models.ForeignKey(EventInstance, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("seat", "event_instance")

    def __str__(self):
        return f"{self.event_instance} - {self.seat}"

class Order(models.Model):
    """Customer ticket order for a seated or general-admission event instance."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
    ]

    eventinstance = models.ForeignKey(EventInstance, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"Order {self.id}"

class OrderSeat(models.Model):
    """Join model reserving a concrete event seat for an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    event_seat = models.ForeignKey(EventSeat, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("event_seat", "order")

    def __str__(self):
        return f"Order {self.order.id} - Seat {self.event_seat.id}"

class Payment(models.Model):
    """Stripe payment state associated with a single order."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    stripe_session_id = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"Payment for Order {self.order.id}"
