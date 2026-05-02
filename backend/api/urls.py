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
    create_checkout_session,
    get_session_details,
    UserOrdersListView,
    UserListView,
    RegisterView,
    PaymantCreateView,
    OrderView,
    EventDetailView,

)

urlpatterns = [
    path('event-instances/', EventListView.as_view()),
    path('host-events/', EventListView.as_view()),
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('host-events/<int:pk>/', EventDetailView.as_view()),
    path('event-instances/<int:pk>/seats/', EventInstanceSeatsListView.as_view()),
    path('get-session-details/', get_session_details, name='session-details'),
    path('venues/', VenueListCreateView.as_view()),
    path('payments/', PaymantCreateView.as_view()),
    path('orders/', OrderView.as_view()),
    path('events/', EventListCreateView.as_view()),
    path('categories/', EventCategoryListCreateView.as_view()),
    path('book-seats/', BookSeatsView.as_view()),
    path('user-order/', UserOrdersListView.as_view()),
    path('users/', UserListView.as_view()),
    path('register/', RegisterView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]