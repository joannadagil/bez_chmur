from rest_framework import serializers
from .models import EventInstance, EventSeat, OrderSeat, Event, Venue, EventCategory

class EventSerializer(serializers.ModelSerializer):
    # Read fields
    title = serializers.CharField(source='event.name', read_only=True)
    image_url = serializers.CharField(source='event.image_url', read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    type = serializers.CharField(source='event.category.name', read_only=True)
    
    # Write fields
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all(), write_only=True)
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all(), write_only=True)
    
    # Calculated fields
    price = serializers.SerializerMethodField()
    seatsLeft = serializers.SerializerMethodField()

    class Meta:
        model = EventInstance
        fields = ['id', 'title', 'venue_name', 'type', 'price', 'seatsLeft', 'image_url', 'event', 'venue', 'time']

    def get_price(self, obj):
        # Calculate lowest price
        prices = EventSeat.objects.filter(event_instance=obj).values_list('seat_category__price', flat=True)
        if not prices:
            return "Free"
        min_price = min(prices)
        return float(min_price) if min_price > 0 else "Free"

    def get_seatsLeft(self, obj):
        total_seats = EventSeat.objects.filter(event_instance=obj).count()
        occupied_seats = OrderSeat.objects.filter(
            event_seat__event_instance=obj,
            order__status__in=['pending', 'paid']
        ).count()
        return total_seats - occupied_seats
    
class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'rows', 'seats_per_row']

class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ['id', 'name']

class EventModelSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=EventCategory.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = Event
        fields = ['id', 'name', 'description', 'category', 'image_url']