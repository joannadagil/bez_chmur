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

# Project Structure


bez_chmur
│
├── backend
│ ├── cinema
│ ├── bookings
│ ├── users
│ └── manage.py
│
├── frontend
│ ├── src
│ │ ├── components
│ │ ├── pages
│ │ ├── api
│ │ └── App.tsx
│
└── README.md



---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/your-username/bez_chmur.git
cd bez_chmur
```
## 2. Backend setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

```bash
# Windows
venv\Scripts\activate
# Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start backend server:

```bash
python manage.py runserver
```

## 3. Frontend setup

(in frontend folder) 

Install dependencies:

```bash
npm install
```

```bash
npm run dev
```


# Team 

Marta Czarnecka, Joanna Dagil, Weronika Kłujszo, Semion Lisichik





# API Endpoints

The backend exposes a REST API built with **Django REST Framework**.

Base URL example:

```
/api/
```


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




