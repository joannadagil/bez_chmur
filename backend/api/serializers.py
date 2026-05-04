from rest_framework import serializers
from .models import (
    EventInstance, 
    EventSeat, 
    OrderSeat, 
    Event, 
    Venue, 
    EventCategory, 
    SeatCategory,
    Order,
    User,
    Group,
    Payment,
    )

class EventReadSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='event.name', read_only=True)
    image_url = serializers.CharField(source='event.image_url', read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    type = serializers.CharField(source='event.category.name', read_only=True)
    description = serializers.CharField(source='event.description', read_only=True)
    
    price = serializers.SerializerMethodField()
    seatsLeft = serializers.SerializerMethodField()

    class Meta:
        model = EventInstance
        fields = ['id', 'title', 'venue_name', 'description', 'type', 'price', 'seatsLeft', 'image_url', 'event', 'venue', 'time']

    def get_price(self, obj):
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
    
class EventCreateSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(write_only=True)
    event_description = serializers.CharField(write_only=True, required=False, allow_blank=True)
    event_image_url = serializers.URLField(write_only=True, required=False, allow_null=True)
    category = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=EventCategory.objects.all(), 
        write_only=True
    )
    
    venue_name = serializers.CharField(write_only=True)
    venue_rows = serializers.IntegerField(write_only=True)
    venue_seats_per_row = serializers.IntegerField(write_only=True)
    
    time = serializers.DateTimeField()

    class Meta:
        model = EventInstance
        fields = [
            'id', 'event_name', 'event_description', 'event_image_url', 'category',
            'venue_name', 'venue_rows', 'venue_seats_per_row', 'time'
        ]

    def create(self, validated_data):
        event = Event.objects.create(
            name=validated_data.pop('event_name'),
            description=validated_data.pop('event_description', ''),
            image_url=validated_data.pop('event_image_url', None),
            category=validated_data.pop('category')
        )
        
        venue = Venue.objects.create(
            name=validated_data.pop('venue_name'),
            rows=validated_data.pop('venue_rows'),
            seats_per_row=validated_data.pop('venue_seats_per_row')
        )
        
        return EventInstance.objects.create(
            event=event,
            venue=venue,
            time=validated_data.pop('time'),
            host=self.context['request'].user,
        )
    
class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'rows', 'seats_per_row']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'pk', 'first_name', 'last_name', 'username', 'email', 'password', 'is_active', 'is_staff', 'is_superuser']

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

class SeatCategoryShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatCategory
        fields = ['name', 'price']
        
class EventSeatSerializer(serializers.ModelSerializer):
    row = serializers.CharField(source='seat.row', read_only=True)
    number = serializers.IntegerField(source='seat.number', read_only=True)
    if_exist = serializers.BooleanField(source='seat.if_exist', read_only=True)
    
    is_reserved = serializers.SerializerMethodField()

    seat_category = SeatCategoryShortSerializer(read_only=True)
    
    class Meta:
        model = EventSeat
        fields = ['id', 'row', 'number', 'is_reserved', 'if_exist', 'seat_category']

    def get_is_reserved(self, obj):
        return OrderSeat.objects.filter(
            event_seat=obj,
            order__status__in=['pending', 'paid']
        ).exists()
        
class UserOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    event_name = serializers.CharField(source='eventinstance.event.name', read_only=True)
    venue_name = serializers.CharField(source='eventinstance.venue.name', read_only=True)
    date = serializers.DateTimeField(source='eventinstance.time', read_only=True)
    
    seats = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user_email', 'user_full_name', 'event_name', 'venue_name', 'date', 'status', 'seats']
        
    def get_user_full_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username
    
    def get_seats(self, obj):
        order_seats = OrderSeat.objects.filter(order=obj)
        return [f"{os.event_seat.seat.row}{os.event_seat.seat.number}" for os in order_seats]
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.CharField(required=False, write_only=True, default='customer')

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'user_type']

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'customer')
        email = validated_data.get('email')
        
        user = User.objects.create_user(
            username=email, 
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        group_name = 'Host' if user_type == 'host' else 'Customer'
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        
        return user
    

class PaymentSerializer(serializers.ModelSerializer):
    order = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = ['id', 'order', 'stripe_session_id', 'status', 'order']
        
    def get_order(self, obj):
        return obj.status
    
class OrderSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'eventinstance', 'user', 'status']
        
    def get_user(self, obj):
        return obj.user.email
        