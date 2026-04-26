# Event Management API Documentation

## Authentication & Users

The system uses **JWT (JSON Web Tokens)** for authentication.

* **Registration**: `POST /api/register/`
    * **Payload**: `email`, `password`, `first_name`, `last_name`, `user_type` ('host' or 'customer').
* **Obtain Token**: `POST /api/token/`
    * **Payload**: `email`, `password`.
    * **Returns**: `access` and `refresh` tokens.
* **User List**: `GET /api/users/` (Returns all registered users).

## Event Management

The API allows for managing base event templates and specific event instances.

### Creating a New Event (from raw data)
You can create a complete event occurrence, including the base event details and venue information, in a single request.

**Endpoint**: `POST /api/host-events/` (Requires Authentication)

**Request Body Example**:
```json
{
    "event_name": "Summer Jazz Night",
    "event_description": "An evening of smooth jazz.",
    "category": 1, 
    "event_image_url": "https://example.com/image.jpg",
    "venue_name": "Grand Hall",
    "venue_rows": 10,
    "venue_seats_per_row": 15,
    "time": "2026-06-15T19:00:00Z"
}
```

### Browsing Events
* **List All Events**: `GET /api/event-instances/`.
    * Returns details like `title`, `venue_name`, `price` (minimum seat price), and `seatsLeft`.
* **Event Categories**: `GET /api/categories/` or `POST` to create new ones.

---

## Venues & Seats

* **Venue Management**: `GET /api/venues/` or `POST` to create new venues.
* **Available Seats**: `GET /api/event-instances/<id>/seats/`.
    * Returns a list of seats for a specific event, including their row, number, and current reservation status (`is_reserved`).

---

## Booking & Orders

### Booking Seats
To reserve seats, users must submit the event instance ID and a list of specific seat IDs.

**Endpoint**: `POST /api/book-seats/`

**Request Body**:
```json
{
    "event_instance_id": 1,
    "seat_ids": [101, 102]
}
```

### Managing Orders
* **My Orders**: `GET /api/user-order/` (Requires Authentication).
    * Returns the authenticated user's order history, including event names, dates, status, and seat labels (e.g., "A1").

---