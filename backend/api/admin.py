from django.contrib import admin

# Register your models here.
from .models import Venue, EventCategory, Event, EventInstance, Seat, SeatCategory, EventSeat, Order, OrderSeat, Payment

admin.site.register([Venue, Event, EventInstance, SeatCategory, Seat, EventSeat, Order, OrderSeat, Payment, EventCategory])