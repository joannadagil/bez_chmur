import stripe
from django.conf import settings
from rest_framework import views, status, permissions, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction

stripe.api_key = settings.STRIPE_SECRET_KEY

from .models import (
    Venue,
    Event,
    EventCategory,
    EventInstance,
    EventSeat,
    OrderSeat,
    Order,
    User,
    Payment,
    Seat
    )

from .serializers import (
    VenueSerializer,
    EventModelSerializer,
    EventCategorySerializer,
    EventSeatSerializer,
    UserOrderSerializer,
    UserSerializer,
    RegisterSerializer,
    EventCreateSerializer,
    EventReadSerializer,
    PaymentSerializer,
    OrderSerializer,
    )


class EventListView(generics.ListCreateAPIView):
    queryset = EventInstance.objects.select_related('event', 'venue', 'event__category').all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventReadSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class EventDetailView(generics.RetrieveAPIView):
    queryset = EventInstance.objects.all()
    serializer_class = EventReadSerializer

class VenueListCreateView(generics.ListCreateAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

class PaymantCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class OrderView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
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



@api_view(['POST'])
def create_checkout_session(request):
    data = request.data
    total_price = data.get('total_price') 

    stripe_amount = int(float(total_price) * 100)

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd', 
                    'product_data': {
                        'name': 'Bilety na wydarzenie',
                    },
                    'unit_amount': stripe_amount, 
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url="http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/cancel",
        )
        return Response({'url': session.url})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_session_details(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    session_id = request.GET.get('session_id')
    
    if not session_id:
        return Response({'error': 'No session ID provided'}, status=400)

    try:
        session = stripe.checkout.Session.retrieve(session_id)

        meta = getattr(session, 'metadata', {})
        if meta is None:
            meta = {}

        event_title = meta.get('event_title', 'Bilet')
        venue_name = meta.get('venue_name', 'Sala')
        event_date = meta.get('event_date', '')
        event_time = meta.get('event_time', '')
        seats_raw = meta.get('seats_info', '')
        seats_list = seats_raw.split(', ') if seats_raw else []

        return Response({
            'eventTitle': event_title,
            'selectedVenue': venue_name,
            'date': event_date,
            'time': event_time,
            'seats': seats_list
        }, status=200)

    except Exception as e:
        import traceback
        print("--- FULL ERROR START ---")
        print(traceback.format_exc())
        print("--- FULL ERROR END ---")
        return Response({'error': f"Server error: {str(e)}"}, status=400)