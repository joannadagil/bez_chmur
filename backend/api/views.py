from rest_framework import views, status, permissions, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction


from .models import (
    Venue,
    Event,
    EventCategory,
    EventInstance,
    EventSeat,
    OrderSeat,
    Order,
    User
    )

from .serializers import (
    VenueSerializer,
    EventModelSerializer,
    EventCategorySerializer,
    EventSerializer,
    EventSeatSerializer,
    UserOrderSerializer,
    UserSerializer,
    RegisterSerializer,
    )


class EventListView(generics.ListCreateAPIView):
    queryset = EventInstance.objects.select_related('event', 'venue', 'event__category').all()
    serializer_class = EventSerializer
   

class VenueListCreateView(generics.ListCreateAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventModelSerializer

class EventCategoryListCreateView(generics.ListCreateAPIView):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    
class UserListView(generics.ListCreateAPIView):
    username = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.order_by('-id')
    
class UserOrdersListView(generics.ListAPIView):
    serializer_class = UserOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
class EventInstanceSeatsListView(generics.ListAPIView):
    serializer_class = EventSeatSerializer

    def get_queryset(self):
        instance_id = self.kwargs['pk']
        return EventSeat.objects.filter(event_instance_id=instance_id).select_related('seat', 'seat_category')

class BookSeatsView(views.APIView):
    # TODO: add authentification
    #permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        
        user = request.user
        
        # TODO: remove
        from django.contrib.auth.models import User
        if not user.is_authenticated:
            user = User.objects.first()
        if not user:
            return Response({"error": "No users in database"}, status=400)
        #
        
        event_instance_id = request.data.get('event_instance_id')
        seat_ids = request.data.get('seat_ids', [])

        if not seat_ids:
            return Response({"error": "No seats selected"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                event_instance = EventInstance.objects.get(id=event_instance_id)
                order = Order.objects.create(
                    user=user, 
                    eventinstance=event_instance, 
                    status="pending"
                )

                for s_id in seat_ids:
                    event_seat = EventSeat.objects.get(id=s_id)
                    
                    if OrderSeat.objects.filter(event_seat=event_seat, order__status__in=['pending', 'paid']).exists():
                        raise ValueError(f"Seat {s_id} already taken")

                    OrderSeat.objects.create(order=order, event_seat=event_seat)

                return Response({"order_id": order.id, "message": "Seats reserved"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]