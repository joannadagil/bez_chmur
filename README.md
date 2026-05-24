# GetARoom

**GetARoom** (repository: `bez_chmur`, default branch: `fix/checkout-fixes`) is a web application for browsing and creating events and reserving seats in venues such as cinemas, theatres, and lecture halls.

The project was developed as a full-stack student assignment and has since been migrated to a cloud environment at [get-a-room.pl](https://get-a-room.pl/) hosted on AWS.

**For detailed documentation, go [HERE](./docs/project-description.md).**

---

## Features

- User registration and JWT-based authentication with host and customer account types
- Event catalogue with filtering by venue, date, and event type
- Interactive cinema-style seat map with area-based pricing tiers
- Temporary seat reservation with automatic expiry
- Mock payment flow via Stripe Checkout (test mode - no real charges)
- Event creation with custom venue layout, showings, and scheduling rules (hosts)
- Order history and booking confirmation (customers)
- Dark mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Payments | Stripe Checkout (test mode) |
| Containerisation | Docker, Docker Compose |
| Cloud | AWS |

---

## Running Locally

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)

### Steps

```bash
git clone https://github.com/joannadagil/bez_chmur.git
cd bez_chmur
docker compose up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

### Database migrations

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

---

## Team

| Name | GitHub |
|---|---|
| Marta Czarnecka | [@marghqx](https://github.com/marghqx) |
| Joanna Dagil | [@joannadagil](https://github.com/joannadagil) |
| Weronika Kłujszo | [@Nixx-K](https://github.com/Nixx-K) |
| Semion Lisichik | [@DoManHito](https://github.com/DoManHito) |
