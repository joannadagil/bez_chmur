from django.urls import path
from .views import (
    EventListView, 
    VenueListCreateView, 
    EventListCreateView, 
    EventCategoryListCreateView,
    EventInstanceSeatsListView,
    BookSeatsView,
)

urlpatterns = [
    path('event-instances/', EventListView.as_view()), 
    path('event-instances/<int:pk>/seats/', EventInstanceSeatsListView.as_view()),
    path('venues/', VenueListCreateView.as_view()),
    path('events/', EventListCreateView.as_view()),
    path('categories/', EventCategoryListCreateView.as_view()),
    path('book-seats/', BookSeatsView.as_view()),
]