from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response


from .models import (
    Venue,
    Event,
    EventCategory,
    EventInstance)

from .serializers import (
    VenueSerializer,
    EventModelSerializer,
    EventCategorySerializer,
    EventSerializer)


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