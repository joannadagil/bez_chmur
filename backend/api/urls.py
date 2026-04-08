from django.urls import path
from .views import (
    EventListView, 
    VenueListCreateView, 
    EventListCreateView, 
    EventCategoryListCreateView
)

urlpatterns = [
    path('event-instances/', EventListView.as_view()), 
    
    path('venues/', VenueListCreateView.as_view()),
    path('events/', EventListCreateView.as_view()),
    path('categories/', EventCategoryListCreateView.as_view()),
]