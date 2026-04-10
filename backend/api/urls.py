from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    EventListView, 
    VenueListCreateView, 
    EventListCreateView, 
    EventCategoryListCreateView,
    EventInstanceSeatsListView,
    BookSeatsView,
    UserOrdersListView,
    UserListView,
    RegisterView,
)

urlpatterns = [
    path('event-instances/', EventListView.as_view()), 
    path('event-instances/<int:pk>/seats/', EventInstanceSeatsListView.as_view()),
    path('venues/', VenueListCreateView.as_view()),
    path('events/', EventListCreateView.as_view()),
    path('categories/', EventCategoryListCreateView.as_view()),
    path('book-seats/', BookSeatsView.as_view()),
    path('user-order/', UserOrdersListView.as_view()),
    path('users/', UserListView.as_view()),
    path('register/', RegisterView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]