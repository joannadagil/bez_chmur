import stripe,os
from datetime import timedelta
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import views, status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone


stripe.api_key = settings.STRIPE_SECRET_KEY
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

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
    """List public upcoming event instances or create a hosted event setup."""

    def get_queryset(self):
        """Return upcoming hosted events, optionally filtered by event id."""

        qs = EventInstance.objects.select_related('event', 'venue', 'event__category').filter(host__isnull=False)
        event_id = self.request.query_params.get('event')
        if event_id:
            qs = qs.filter(event_id=event_id)
        if self.request.method == 'GET':
            cutoff = timezone.now() + timedelta(hours=1)
            qs = qs.filter(time__gte=cutoff)
        return qs.order_by('time')

    def get_serializer_class(self):
        """Use write serializer for creation and read serializer for listing."""

        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventReadSerializer

    def get_permissions(self):
        """Require authentication for creation and allow anonymous reads."""

        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class EventDetailView(generics.RetrieveAPIView):
    """Retrieve one public event instance."""

    serializer_class = EventReadSerializer

    def get_queryset(self):
        """Return all event instances for public detail lookups."""

        return EventInstance.objects.all()

class HostEventListView(generics.ListCreateAPIView):
    """List or create event instances owned by the authenticated host."""

    def get_queryset(self):
        """Return the host's upcoming showings, optionally filtered by event id."""

        qs = EventInstance.objects.select_related(
            'event', 'venue', 'event__category', 'host'
        ).filter(host=self.request.user)
        event_id = self.request.query_params.get('event')
        if event_id:
            qs = qs.filter(event_id=event_id)
        if self.request.method == 'GET':
            cutoff = timezone.now() + timedelta(hours=1)
            qs = qs.filter(time__gte=cutoff)
        return qs.order_by('time')

    def get_serializer_class(self):
        """Use write serializer for creation and read serializer for listing."""

        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventReadSerializer

    def get_permissions(self):
        """Require an authenticated user for every host event operation."""

        return [permissions.IsAuthenticated()]

class HostEventDetailView(generics.RetrieveAPIView):
    """Retrieve a single upcoming event instance for the authenticated host."""

    serializer_class = EventReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Limit detail access to future showings owned by the request user."""

        qs = EventInstance.objects.select_related(
            'event', 'venue', 'event__category', 'host'
        ).filter(host=self.request.user)
        cutoff = timezone.now() + timedelta(hours=1)
        return qs.filter(time__gte=cutoff)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_role(request):
    """Return profile basics and whether the current user is a host."""

    user = request.user
    is_host = user.groups.filter(name='Host').exists()
    return Response({
        'email': user.email,
        'accountType': 'host' if is_host else 'customer',
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

class VenueListCreateView(generics.ListCreateAPIView):
    """List or create venue layouts."""

    serializer_class = VenueSerializer

    def get_queryset(self):
        """Return all venues."""

        return Venue.objects.all()

class PaymantCreateView(generics.ListCreateAPIView):
    """List or create payment records for administrative flows."""

    serializer_class = PaymentSerializer

    def get_queryset(self):
        """Return all payments."""

        return Payment.objects.all()
    
class OrderView(generics.ListCreateAPIView):
    """List or create orders for administrative flows."""

    serializer_class = OrderSerializer

    def get_queryset(self):
        """Return all orders."""

        return Order.objects.all()

class EventListCreateView(generics.ListCreateAPIView):
    """List or create reusable event definitions."""

    serializer_class = EventModelSerializer

    def get_queryset(self):
        """Return all event definitions."""

        return Event.objects.all()

class EventCategoryListCreateView(generics.ListCreateAPIView):
    """List or create event categories."""

    serializer_class = EventCategorySerializer

    def get_queryset(self):
        """Return all event categories."""

        return EventCategory.objects.all()

class UserListView(generics.ListCreateAPIView):
    """List users for administrative screens."""

    serializer_class = UserSerializer

    def get_queryset(self):
        """Return newest users first."""

        return User.objects.order_by('-id')

class UserOrdersListView(generics.ListAPIView):
    """List ticket orders belonging to the authenticated user."""

    serializer_class = UserOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return all orders owned by the request user."""

        return Order.objects.filter(user=self.request.user)
        # TODO: not sure of the convention, but if we want only paid orders, we could
        # # return Order.objects.filter(user=self.request.user, status='paid')


class EventInstanceSeatsListView(generics.ListAPIView):
    """List event-specific seats with reservation status."""

    serializer_class = EventSeatSerializer

    def get_queryset(self):
        """Return seats assigned to the event instance id from the route."""

        instance_id = self.kwargs['pk']
        return EventSeat.objects.filter(event_instance_id=instance_id).select_related('seat', 'seat_category')


# TODO: ten endpoint może zniknąć, ale możemy go też zostawić jako stary endpoint testowy
# Legacy endpoint kept for manual/testing flows.
# Main purchase flow goes through Stripe checkout session.
class BookSeatsView(views.APIView):
    """Legacy endpoint that reserves selected seats without Stripe checkout."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Create a pending order after validating event and seat availability."""

        user = request.user
        event_instance_id = request.data.get('event_instance_id')
        seat_ids = request.data.get('seat_ids', [])

        if not event_instance_id:
            return Response(
                {"error": "Missing event_instance_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not seat_ids:
            return Response(
                {"error": "No seats selected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                event_instance = EventInstance.objects.get(id=event_instance_id)

                event_seats = list(
                    EventSeat.objects.filter(
                        id__in=seat_ids,
                        event_instance=event_instance
                    )
                )

                if len(event_seats) != len(seat_ids):
                    return Response(
                        {"error": "Some selected seats do not exist for this event instance"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                for event_seat in event_seats:
                    if OrderSeat.objects.filter(
                        event_seat=event_seat,
                        order__status__in=['pending', 'paid']
                    ).exists():
                        return Response(
                            {"error": f"Seat {event_seat.id} already taken"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                order = Order.objects.create(
                    user=user,
                    eventinstance=event_instance,
                    status="pending"
                )

                for event_seat in event_seats:
                    OrderSeat.objects.create(order=order, event_seat=event_seat)

                return Response(
                    {"order_id": order.id, "message": "Seats reserved"},
                    status=status.HTTP_201_CREATED
                )

        except EventInstance.DoesNotExist:
            return Response(
                {"error": "Event instance not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(generics.CreateAPIView):
    """Register a new customer or host account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get_queryset(self):
        """Return all users for create view metadata and tooling."""

        return User.objects.all()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """Reserve tickets and create a Stripe Checkout session for payment."""

    data = request.data
    event_instance_id = data.get('event_instance_id')
    seat_ids = data.get('seat_ids', [])
    total_price = data.get('total_price')
    try:
        quantity = int(data.get('quantity', 1) or 1)
    except (TypeError, ValueError):
        return Response({'error': 'Invalid quantity'}, status=400)

    if not event_instance_id:
        return Response({'error': 'Missing event_instance_id'}, status=400)

    if total_price in [None, '']:
        return Response({'error': 'Missing total_price'}, status=400)

    try:
        stripe_amount = int(float(total_price) * 100)
    except (TypeError, ValueError):
        return Response({'error': 'Invalid total_price'}, status=400)

    try:
        with transaction.atomic():
            user = request.user
            event_instance = EventInstance.objects.get(id=event_instance_id)
            cutoff = timezone.now() + timedelta(hours=1)
            if event_instance.time < cutoff:
                return Response({'error': 'This showing is no longer available for purchase'}, status=400)

            has_assigned_seats = EventSeat.objects.filter(event_instance=event_instance).exists()
            is_no_seats = not has_assigned_seats

            if is_no_seats:
                if quantity <= 0:
                    return Response({'error': 'Quantity must be at least 1'}, status=400)

                capacity = event_instance.venue.rows * event_instance.venue.seats_per_row
                already_reserved = Order.objects.filter(
                    eventinstance=event_instance,
                    status__in=['pending', 'paid']
                ).aggregate(total=Sum('quantity'))['total'] or 0

                if quantity > max(capacity - already_reserved, 0):
                    return Response({'error': 'Not enough tickets left for this event'}, status=400)

                event_seats = []
                seat_labels = []
            else:
                if not seat_ids:
                    return Response({'error': 'No seats selected'}, status=400)

                event_seats = list(
                    EventSeat.objects.filter(
                        id__in=seat_ids,
                        event_instance=event_instance
                    ).select_related('seat')
                )
                if len(event_seats) != len(seat_ids):
                    return Response({'error': 'Some selected seats do not exist'}, status=400)
                for event_seat in event_seats:
                    already_taken = OrderSeat.objects.filter(
                        event_seat=event_seat,
                        order__status__in=['pending', 'paid']
                    ).exists()
                    if already_taken:
                        return Response(
                            {'error': f'Seat {event_seat.id} is already taken'},
                            status=400
                        )
                seat_labels = [
                    f"{event_seat.seat.row}{event_seat.seat.number}"
                    for event_seat in event_seats
                ]

            order = Order.objects.create(
                user=user,
                eventinstance=event_instance,
                status='pending',
                quantity=quantity if is_no_seats else len(event_seats),
            )

            for event_seat in event_seats:
                OrderSeat.objects.create(order=order, event_seat=event_seat)

            payment = Payment.objects.create(
                order=order,
                status='pending',
            )

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': event_instance.event.name,
                        },
                        'unit_amount': stripe_amount,
                    },
                    'quantity': quantity if is_no_seats else 1,
                }],
                mode='payment',
                success_url=f'{frontend_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{frontend_url}/checkout/payment',
                metadata={
                    'order_id': str(order.id),
                    'payment_id': str(payment.id),
                    'event_instance_id': str(event_instance.id),
                    'event_title': event_instance.event.name,
                    'venue_name': event_instance.venue.name,
                    'event_date': event_instance.time.date().isoformat(),
                    'event_time': event_instance.time.strftime('%H:%M'),
                    'seats_info': ', '.join(seat_labels) if seat_labels else f'{quantity} general admission',
                    'user_id': str(user.id),
                },
            )

            payment.stripe_session_id = session.id
            payment.save()

            return Response({'url': session.url}, status=200)

    except EventInstance.DoesNotExist:
        return Response({'error': 'Event instance not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """Handle Stripe Checkout completion and expiration events."""

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        print("Webhook event type:", event["type"])
    except Exception as e:
        print("Webhook verification failed:", repr(e))
        return HttpResponse(status=400)

    try:
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            stripe_session_id = session["id"]
            print("Completed session id:", stripe_session_id)

            payment = Payment.objects.select_related("order").get(
                stripe_session_id=stripe_session_id
            )
            print("Found payment id:", payment.id, "order id:", payment.order.id)

            payment.status = "paid"
            payment.save()

            order = payment.order
            order.status = "paid"
            order.save()

            print("Updated payment and order to paid")

        elif event["type"] == "checkout.session.expired":
            session = event["data"]["object"]
            stripe_session_id = session["id"]
            print("Expired session id:", stripe_session_id)

            payment = Payment.objects.select_related("order").get(
                stripe_session_id=stripe_session_id
            )

            payment.status = "cancelled"
            payment.save()

            order = payment.order
            order.status = "expired"
            order.save()

            print("Updated payment to cancelled and order to expired")

        return HttpResponse(status=200)

    except Payment.DoesNotExist:
        print("Payment not found for session")
        return HttpResponse(status=404)

    except Exception as e:
        import traceback
        print("--- WEBHOOK ERROR START ---")
        print(traceback.format_exc())
        print("--- WEBHOOK ERROR END ---")
        return HttpResponse(status=500)



@api_view(['GET'])
def get_session_details(request):
    """Return checkout confirmation details for a Stripe session id."""

    session_id = request.GET.get('session_id')

    if not session_id:
        return Response({'error': 'No session ID provided'}, status=400)

    try:
        payment = Payment.objects.select_related(
            'order',
            'order__eventinstance',
            'order__eventinstance__event',
            'order__eventinstance__venue',
        ).get(stripe_session_id=session_id)

        order = payment.order
        event_instance = order.eventinstance

        order_seats = OrderSeat.objects.filter(order=order).select_related('event_seat__seat')
        seats_list = [
            f"{os.event_seat.seat.row}{os.event_seat.seat.number}"
            for os in order_seats
        ]

        return Response({
            'eventTitle': event_instance.event.name,
            'selectedVenue': event_instance.venue.name,
            'date': event_instance.time.date().isoformat(),
            'time': event_instance.time.strftime('%H:%M'),
            'seats': seats_list,
        }, status=200)

    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found for this session.'}, status=404)

    except Exception as e:
        import traceback
        print('--- FULL ERROR START ---')
        print(traceback.format_exc())
        print('--- FULL ERROR END ---')
        return Response({'error': f'Server error: {str(e)}'}, status=400)
