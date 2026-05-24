## 1. Overview

### 1.1. Summary
This document describes the architecture and deployment of the "Get-A-Room" full-stack web application. The goal was to migrate a locally running development stack (`localhost`) to a production environment hosted on AWS, with proper containerization, security, and availability.

The local setup lacked fault tolerance, had manual configuration management, and was a single point of failure. The new architecture addresses these issues through separation of concerns, containerization, and network security controls.

### 1.2. Key Design Decisions

1. **Frontend/backend separation:** The React and the Django API are deployed independently. They communicate over HTTPS. This allows each layer to scale on its own and prevents API load from affecting frontend performance.

2. **Secrets management:** No credentials are stored in the codebase or Docker images. All environment variables (database passwords, API keys, etc.) are fetched at runtime from AWS SSM Parameter Store.

3. **Stripe webhook integration:** Checkout is handled via a two-step flow. The frontend initiates the session; the backend updates the database only after receiving a verified webhook from Stripe. This prevents data inconsistencies caused by dropped client connections or network interruptions.

---

## 2. System Architecture

The platform uses a standard three-tier setup: a static frontend served via CDN, a backend API running on EC2, and a PostgreSQL database on RDS. All components live within AWS and communicate via HTTP/HTTPS.

```
                        [ Internet User ]
                                |
                        ( Route 53 DNS )
                         /             \
      [ get-a-room.pl ] /               \ [ api.get-a-room.pl ]
                       v                 v
           +-----------------------+ +-----------------------------+
           |  CloudFront CDN       | |  Application Load Balancer  |
           +-----------------------+ +-----------------------------+
                       |                            |
                       v (Static Assets)            | (HTTPS Offloading)
           +-----------------------+                v
           |  Amazon S3 Bucket     |   +-------------------------+
           +-----------------------+   | EC2 Instance (Docker)   |
                                       | +---------------------+ |
                                       | | Django Container    | |
                                       | +---------------------+ |
                                       +-------------------------+
                                                    |
                                                    v 
                                       +-------------------------+
                                       | Amazon RDS (PostgreSQL) |
                                       +-------------------------+
```

### 2.1. Component Breakdown

#### 2.1.1. Frontend
The user interface is a React SPA bundled with Vite.

- **Storage:** The compiled build (HTML, JS, CSS, images) is stored in an **Amazon S3** bucket. Direct public access to the bucket is disabled — files are only accessible through CloudFront.
- **CDN:** **Amazon CloudFront** serves the static files to users from the nearest edge location. It fetches files from S3 using Origin Access Control (OAC). This reduces latency and offloads traffic from the backend.

#### 2.1.2. Backend
Application logic is handled by a **Django (Python)** WSGI application.

- **Containerization:** The Django app runs inside a **Docker** container (`margh/backend-django:latest`). This ensures consistent behavior across environments.
- **Compute:** The container runs on an **Amazon EC2** instance. Port `8000` inside the container is mapped to port `8000` on the host. The container is started with `--restart always`, so it automatically restarts after crashes or reboots.

#### 2.1.3. Database
Relational data is stored in **PostgreSQL** running on **Amazon RDS**.

- RDS handles automated backups, patching, and multi-AZ failover.
- The database is placed in a private subnet with no public IP address. Its Security Group only allows inbound connections on port `5432` from the EC2 instance.

#### 2.1.4. Ingress and TLS

- **DNS:** **Amazon Route 53** resolves domain names to AWS resources using A-type Alias records.
- **Load Balancer:** An **Application Load Balancer (ALB)** handles incoming HTTPS traffic. It terminates TLS using a certificate from **AWS Certificate Manager (ACM)** and forwards plain HTTP to the EC2 instance on port `8000`. This offloads TLS processing from the application server.

---

## 3. Network Configuration and DNS Routing

### 3.1. DNS Mapping
Route 53 is the DNS provider for the `get-a-room.pl` zone. A-type Alias records are used instead of CNAMEs to avoid the extra DNS lookup that CNAMEs require, and because Alias records integrate directly with AWS resource health monitoring.

| Domain | Record Type | Target | Purpose |
| :--- | :--- | :--- | :--- |
| `get-a-room.pl` | `A (Alias)` | `d12345678abcde.cloudfront.net` | Serves the React frontend via CloudFront. |
| `api.get-a-room.pl` | `A (Alias)` | `alb-backend-123456.eu-central-1.elb.amazonaws.com` | Routes API requests and Stripe webhooks to the backend. |

### 3.2. Traffic Flow: API Requests

Incoming HTTPS traffic hits the ALB on port `443`. The ALB terminates TLS using a certificate from ACM and forwards plain HTTP to the EC2 instance on port `8000`. The EC2 Security Group only allows traffic from the ALB — direct access from the internet is blocked. Docker maps host port `8000` into the Django container.

```
[ Client ] ---> HTTPS :443 ---> [ ALB ] ---> HTTP :8000 ---> [ EC2 ] ---> [ Django Container ]
```

---

## 4. CDN and SPA Routing

### 4.1. Problem
React Router handles navigation client-side. When a user navigates directly to a URL like `https://get-a-room.pl/checkout/success` (e.g. after returning from Stripe), CloudFront tries to find a file at that path in S3. Since no such file exists, S3 returns a `403` or `404` error.

### 4.2. Fix: CloudFront Error Responses
CloudFront was configured to intercept `403` and `404` errors and return `/index.html` with a `200 OK` status instead. React then loads and renders the correct view based on the URL.

After applying this change, a full cache invalidation was triggered (`/*`) to ensure the new rules took effect immediately.

---

## 5. Stripe Integration

### 5.1. Dynamic URLs
Checkout session URLs are built from the `FRONTEND_URL` environment variable rather than hardcoded values:

```python
import os
import stripe

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

session = stripe.checkout.Session.create(
    payment_method_types=['card'],
    line_items=[...],
    mode='payment',
    success_url=f'{frontend_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}',
    cancel_url=f'{frontend_url}/checkout/cancel',
)
```

> The double curly braces `{{CHECKOUT_SESSION_ID}}` are required Python syntax to escape the f-string interpolation, passing the literal `{CHECKOUT_SESSION_ID}` placeholder to Stripe for substitution.

### 5.2. Webhooks
Stripe sends `checkout.session.completed` events via POST to `https://api.get-a-room.pl/api/stripe/webhook/`. The Django handler verifies each request using an HMAC-SHA256 signature checked against the `STRIPE_WEBHOOK_SECRET` environment variable.

---

## 6. Deployment Script and Secrets Management

Credentials are not stored in the codebase or Docker images. They are fetched at startup from **AWS SSM Parameter Store** (region: `eu-north-1`).

### 6.1. API Limit Workaround
The `aws ssm get-parameters` command supports a maximum of 10 parameters per call. Since the project uses 13 variables, the fetch is split into two calls and the results are merged.

### 6.2. Deployment Script (`start.sh`)

SSM parameters are written to a temporary file in `/tmp` using `awk` to format each line as `KEY=VALUE`. Docker reads the file directly via `--env-file`, so no secrets pass through the shell interpreter. The file is deleted immediately after the container starts.

```bash
#!/bin/bash

echo "Fetching secrets from AWS Parameter Store..."

# Create a temporary env file in /tmp
ENV_FILE=$(mktemp)

# Chunk 1: Application and Database configuration parameters (10 items - max API limit)
aws ssm get-parameters \
  --names "ALLOWED_HOSTS" "DATABASE_HOST" "DATABASE_NAME" "DATABASE_PASSWORD" "DATABASE_PORT" "DATABASE_URL" "DATABASE_USER" "DEBUG" "FRONTEND_URL" "SECRET_KEY" \
  --with-decryption \
  --region eu-north-1 \
  --query "Parameters[*].[Name,Value]" \
  --output text | awk '{print $1 "=" $2}' >> "$ENV_FILE"

# Chunk 2: Stripe payment gateway configuration parameters (3 items)
aws ssm get-parameters \
  --names "STRIPE_PUBLISHABLE_KEY" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET" \
  --with-decryption \
  --region eu-north-1 \
  --query "Parameters[*].[Name,Value]" \
  --output text | awk '{print $1 "=" $2}' >> "$ENV_FILE"

# Check that the env file is non-empty before proceeding
if [ -s "$ENV_FILE" ]; then
  echo "Secrets fetched successfully. Restarting backend container..."

  docker stop backend-api 2>/dev/null
  docker rm backend-api 2>/dev/null

  docker run -d \
    --name backend-api \
    --restart always \
    -p 8000:8000 \
    --env-file "$ENV_FILE" \
    margh/backend-django:latest

  echo "Backend has been launched successfully."
else
  echo "Error: Failed to fetch parameters from AWS. Check IAM role permissions or region availability."
fi

# Delete the temporary env file immediately after use
rm -f "$ENV_FILE"
```

### 6.3. IAM Permissions
The EC2 instance uses an IAM Role with the `AmazonSSMReadOnlyAccess` policy. This allows the instance to read SSM parameters without storing any credentials on disk or in environment files.
