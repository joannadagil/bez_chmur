# GetARoom - project description


---

## Project overview

**GetARoom** (repository: `bez_chmur`, default branch: `fix/checkout-fixes`, post-migration branch: `cloud-migration`) is a web application for browsing and creating events and reserving seats in venues such as cinemas, theatres, and lecture halls. Users are split into two account versions - host and customer and can view upcoming events (cusotmers can view all upcoming events while hosts only see the ones created by them), temporarily hold seats, 'buy' tickets through completing a mock payment flow powered by Stripe Checkout (customers), create new events in either pre-prepared seated halls or no-seats venues and choose areas and prices (hosts).

The project was developed as a full-stack student assignment and has since been migrated to a cloud environment at [get-a-room.pl](https://get-a-room.pl/) hosted on AWS.

---

## Team

| Name | GitHub account |
|---|---|
| Marta Czarnecka | [@marghqx](https://github.com/marghqx) |
| Joanna Dagil | [@joannadagil](https://github.com/joannadagil) |
| Weronika Kłujszo |[@Nixx-K](https://github.com/Nixx-K) |
| Semion Lisichik | [@DoManHito](https://github.com/DoManHito) |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Payments | Stripe Checkout (test mode) |
| Containerisation | Docker, Docker Compose |
| Cloud | AWS (see [cloud migration description file](./cloud_migration.md)) |

---

## Features

- User registration and JWT-based authentication
- Event catalogue with filtering by venue, date, and event type
- Interactive cinema-style seat map showing available, booked and removed seats (available for 'seated' venues only) with their respective areas (Area 1 - more expensive, Area 2 - less expensive, VIP - most expensive, Handicap - least expensive. Area placement varies for different event types - 'Cinema' will hold more expensive seats in the back, while 'Theater' will hold them int he front. There are no changes for 'Lecture hall')
- Temporary seat reservation with automatic expiry
- Mock payment flow via Stripe Checkout (no real charges)
- Ticket order history for customers
- Dark-mode
- Debug randomizer buttons to quickly check proper functionality
- Event creation mode allowing for custom venue outline (seat removal feature), event title, description, poster graphic, number of showings per event and their respective dates and starting hours (there must be at least one hour break between the end of one showing till the beggining of the next one during a day)
- Venue-holding system (if a certain venue is occupied on at least one of the dates planned, it will be blocked in venue choosing)

---

## User flows

### Customer

1. Login, forgot-password or register --> 2.
2. Customer dashboard with host-made events to choose from --> 3.
3. Event details page with event title, poster, description, and all available upcoming dates and starting hours (upcoming = within 1 hour or more) --> 4.
4. Seat outline view with seats to choose from --> 5.
5. Confirm & pay --> mockup Stripe Checkout --> 2.

All tickets (pending, paid and past) can be seen in 'My Tickets' segment in the cutomer's profile (visible after clicking on profile picture icon).

### Host

1. Login, forgot-password or register (registration requires additional information - NIP, company name, company address) --> 2.
2. Host dashboard with the events made by this host account --> 3./4.
3. Manage-existing-event page with a room outline (for seated venue events only) per each showing and information regarding the amount of seats left per showing
4. Create new event page (title, description, poster, type, dates, starting hours and duration of each showing) --> 5.
5. Pick-a-venue page with a list of all available halls (the amount of seats available between them differs. Current biggest hall is 'Hall A' with 500 seats and the smallest is 'Tiny Room' with 50 seats) for seated events (--> 6.) or no-seats venue (--> 8.)
6. Choose which seats to remove (optional) --> 7.
7. Choose areas and pricing per area. At least one area must be chosen --> 2.
8. Choose the location address, dimensions of the room (XxYxZ, Z being the amount of floors of the venue), amount of tickets and price-per-ticket. No areas in this venue type, which means all tickets cost the exact same --> 2.

---

## Repository structure

```
bez_chmur/
├── backend/          # Django application + REST API
├── frontend/         # React + TypeScript SPA
├── init-db/          # Database initialisation scripts
├── docs/             # Project documentation (heyyy, you're here!)
├── docker-compose.yaml
├── .env.example
└── README.md
```

---

## Running Locally

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/joannadagil/bez_chmur.git
cd bez_chmur

# 2. Start all services
docker compose up
```

The following services will be available:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

### Database migrations

After making changes to models, run:

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

To inspect the database:

```bash
docker compose exec db psql -U myuser -d myproject_db
\dt           # list tables
\d api_event  # describe a table
```

---

## API Reference

The backend exposes a REST API built with Django REST Framework.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register/` | Register a new user |
| `POST` | `/api/token/` | Log in and receive a JWT access + refresh token |
| `POST` | `/api/token/refresh/` | Refresh an expired access token |
| `GET` | `/api/me-role/` | Get current user's profile and account type (host/customer) |

### Events

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/event-instances/` | List all upcoming public events (supports `?event=` filter) |
| `GET` | `/api/event-instances/{id}/` | Get details of a single event instance |
| `GET` | `/api/host-events/` | List events created by the authenticated host |
| `GET POST` | `/api/events/` | List or create event definitions |
| `GET POST` | `/api/categories/` | List or create event categories |

### Seats & Venues

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/event-instances/{id}/seats/` | Get the seating layout for an event instance |
| `GET POST` | `/api/venues/` | List or create venues |

Seat statuses: `available` · `held` · `booked`

### Booking & Payments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/create-checkout-session/` | Reserve seats and create a Stripe Checkout session |
| `GET` | `/api/session-details/` | Get booking confirmation details for a session ID |
| `GET` | `/api/user-order/` | List all orders for the authenticated user |
| `POST` | `/api/stripe/webhook/` | Stripe webhook handler (internal) |

---

## Possible future improvements

These are enhancements and refactors the team identified during development that could improve the system in a future iteration.

- **Separate locations from halls** - currently, for seated venues the venue is a flat concept; splitting it into a `Location` (physical building, city, address - such as in the non-seated venue type) and a `Hall` (specific room within a location or simply a room outline, with its own seating layout) would make the system more realistic and scalable. A single location (e.g. a university campus) could then host multiple halls with different capacities and configurations. Also, one event (such as a movie showiny g) could happen in multiple cinemas, whilst it's currently tied to one.
- **Recurring events** - add support for event series / recurring schedules instead of only one-off events. Current version allows for one event to have unlimited showings (if the 1 hour break between two showings in one day rule is respected), but it cannot be edited once made. Therefore, if the host wants to renew an event in the future season, they will have to cretae it all over again.
- **Email notifications** - send booking confirmations, password-retrieval codes and reminders via email.
- - **Promo codes** - adding promo codes, vouchers, etc. based off for example whether the customer is a student. 
- **QR code as e-ticket** - currently, no ticket artifact is generated after booking. The current QR system is for visuals and returns info such as seat numbers (for a seated venue), event title and date. Instead, after a confirmed booking we could generate a PDF or in-app e-ticket containing a QR code encoding the reservation ID. This could be validated at the venue entrance.
- **Cancellations** - a way for a customer to cancel their reservation.
- **Why the one hour?** - one-hour break between theatre shows is valid, but it's way too long for a 'Cinema' type event. Currently, the one-hour break is hard-coded and it could instead be changed to vary per event type.
- **Comments / FY model** - features allowing customers to leave comments under a sepcific event or rate it. Then, a ML system to reccommend events similar to what the customer had enjoyed could be implemented.
- **Seat selection persistence** - preserve selected seats across a page refresh (e.g. via `sessionStorage`) so users do not lose their selection by accident.
- **Mobile-first redesign** - the current seat grid layout is primarily desktop-oriented; a responsive redesign would improve usability on phones.
- **CI/CD pipeline** - add GitHub Actions to run tests and lint on every pull request, and optionally deploy automatically on merge to `main`.

---

## Related documentation

- [Cloud Migration Guide (AWS)](./cloud_migration.md) — step-by-step instructions for deploying the application to AWS.
