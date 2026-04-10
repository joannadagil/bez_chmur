from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

# Register your models here.
from .models import (
    Venue, 
    EventCategory, 
    Event, 
    EventInstance, 
    Seat, 
    SeatCategory, 
    EventSeat, 
    Order, 
    OrderSeat, 
    Payment,
    )

admin.site.register([
    Venue, 
    Event, 
    EventInstance, 
    SeatCategory, 
    Seat, 
    EventSeat, 
    Order, 
    OrderSeat, 
    Payment, 
    EventCategory,
    ])

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'get_groups', 'is_staff')

    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])
    get_groups.short_description = 'Groups'

admin.site.unregister(User)
admin.site.register(User, UserAdmin)