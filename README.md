# bez_chmur

**bez_chmur** is a web application for reserving and purchasing seats in venues such as cinemas, theatres, and university lecture halls.

The system allows users to browse events, view seat availability, reserve seats, and complete a mock payment process.

This project was created as a full-stack application using modern web technologies.

---

# Features

- User registration and authentication
- Event catalogue with filtering by venue and date
- Interactive seat selection similar to cinema booking systems
- Temporary seat reservation with expiration
- Mock payment flow using **Stripe Checkout (test mode)**
- Order management and booking confirmation
- Admin management of venues, events, and bookings

---

# Tech Stack

## Frontend
- React
- TypeScript
- REST API communication

## Backend
- Django
- Django REST Framework

## Database
- PostgreSQL

## Payments
- Stripe Checkout (test mode)  
Used to simulate payment flow without real transactions.

---

# Main Application Views

## 1. Registration / Login
User authentication system allowing users to create accounts and log in to manage their bookings.

## 2. Main Page
Landing page displaying a catalogue of events with filtering options:
- venue
- date
- event type

## 3. Event Page
Detailed information about a selected event including:
- venue
- date and time
- seating layout
- ticket price

Users can select seats directly from an interactive seat map.

## 4. Seat Selection
Cinema-style seating grid showing:
- available seats
- reserved seats
- selected seats

Seats are temporarily locked during the reservation process.

## 5. Payment Page
Mock payment interface using **Stripe Checkout (test mode)**.

Users are redirected to Stripe's sandbox checkout to simulate payment and then returned to the application.

## 6. Booking Confirmation
After successful payment, users receive confirmation and their seats are marked as booked.


---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/joannadagil/bez_chmur.git
cd bez_chmur
```

## 2. Run containers

```bash
docker compose up
```
http://localhost:8000/admin/
http://localhost:8000/api/

### Running migrations after changes to database

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# view the tables
docker compose exec db psql -U myuser -d myproject_db

\dt
\d api_event
```

# API Endpoints

The backend exposes a REST API built with **Django REST Framework**.

---

### Authentication

#### Register a new user

```
POST /api/auth/register
```

Request body:

```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com"
}
```

#### Login

```
POST /api/auth/login
```

Request body:

```json
{
  "username": "user123",
  "password": "password123"
}
```

Response:

```json
{
  "token": "authentication_token"
}
```


### Events

#### Get list of events

```
GET /api/events
```

Optional query parameters:

```
/api/events?venue=main_hall
/api/events?date=2026-05-20
```

Response:

```json
[
  {
    "id": 1,
    "title": "Hamlet",
    "venue": "Main Theatre",
    "date": "2026-05-20T19:00:00"
  }
]
```

#### Get event details

```
GET /api/events/{event_id}
```

Response:

```json
{
  "id": 1,
  "title": "Hamlet",
  "venue": "Main Theatre",
  "date": "2026-05-20T19:00:00",
  "price": 40
}
```

### Seats 

#### Get seating layout for event

```
GET /api/events/{event_id}/seats
```

Response:

```json
[
  {
    "seat_id": 15,
    "row": 3,
    "number": 5,
    "status": "available"
  },
  {
    "seat_id": 16,
    "row": 3,
    "number": 6,
    "status": "booked"
  }
]
```

Seat status values:

- available

- held

- booked
- 

### Reservations

#### Reserve seats

```
POST /api/reservations
```

Request body:

```json
{
  "event_id": 1,
  "seat_ids": [15, 16]
}
```

Response:

```json
{
  "reservation_id": 42,
  "status": "held",
  "expires_at": "2026-05-20T18:05:00"
}
```

Seats are temporarily locked until payment is completed.

### Payments

### User


# Team 

Marta Czarnecka, Joanna Dagil, Weronika Kłujszo, Semion Lisichik


