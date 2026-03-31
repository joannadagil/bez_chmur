from django.db import models
from django.contrib.auth.models import User #django's built in user model

class Venue(models.Model):
    name = models.CharField(max_length=255)
    rows = models.IntegerField()
    seats_per_row = models.IntegerField()

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            for r in range(1, self.rows + 1):
                for s in range(1, self.seats_per_row + 1):
                    Seat.objects.create(venue=self, row=r, number=s)

class EventCategory(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE, null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.name

class EventInstance(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    time = models.DateTimeField()

    def __str__(self):
        return f"{self.event.name} at {self.time}"

class SeatCategory(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Seat(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    row = models.IntegerField()
    number = models.IntegerField()
    exist = models.BooleanField(default=True)

    class Meta:
        unique_together = ("venue", "row", "number")

    def __str__(self):
        return f"Row {self.row} Seat {self.number}"

# This model links seats to event instances and seat categories
class EventSeat(models.Model):
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    seat_category = models.ForeignKey(SeatCategory, on_delete=models.CASCADE)
    event_instance = models.ForeignKey(EventInstance, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("seat", "event_instance")

    def __str__(self):
        return f"{self.event_instance} - {self.seat}"

class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
    ]

    eventinstance = models.ForeignKey(EventInstance, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"Order {self.id}"

class OrderSeat(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    event_seat = models.ForeignKey(EventSeat, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("event_seat", "order")

    def __str__(self):
        return f"Order {self.order.id} - Seat {self.event_seat.id}"

class Payment(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"Payment for Order {self.order.id}"