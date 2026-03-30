from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(Venue)
admin.site.register(Event)
admin.site.register(EventInstance)
admin.site.register(SeatCategory)
admin.site.register(Seat)
admin.site.register(EventSeat)
admin.site.register(Order)
admin.site.register(OrderSeat)
admin.site.register(Payment)
admin.site.register(EventCategory)