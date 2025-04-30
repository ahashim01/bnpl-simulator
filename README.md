# BNPL Payment System

A Buy Now, Pay Later (BNPL) payment system that allows merchants to offer installment payment plans to their customers.

## Features

- Merchant and customer user roles
- Payment plan creation and management
- Installment tracking and payment processing
- Real-time dashboard with analytics
- Email notifications for payment reminders
- Secure API with JWT authentication

## Quick Start Guide

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1. Clone the repository:
   ```bash
    git clone https://github.com/yourusername/bnpl-simulator.git
    cd bnpl-simulator
    ```

2. Start the application with Docker Compose:
    ```bash
    docker-compose up -d
    ```

3. Set up the initial database and create a superuser:
    ```bash
    # Apply migrations
    docker-compose exec backend python manage.py migrate

    # Create a superuser (admin)
    docker-compose exec backend python manage.py createsuperuser
    ```

4. Access the application:
    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend API: [http://localhost:8000/api](http://localhost:8000/api)
    - Admin panel: [http://localhost:8000/admin](http://localhost:8000/admin)


### Stopping the Application:
```bash
docker-compose down
```
#### To remove volumes (database data) as well:
```bash
docker-compose down -v
```
### Creating Test Users and Payment Plans
### Via Django Admin

1. Log in to the Django admin panel at http://localhost:8000/admin with your superuser credentials.
2. Create test users:
    - Navigate to "Users" and click "Add User"
    - Set the username, password, and other required fields
    - To make a user a merchant, check the "Is merchant" checkbox
    - Save the user

3. Creating Payment Plans:
    - Navigate to "Payment plans" and click "Add Payment Plan"
    - Select a merchant and a customer from the dropdown menus
    - Enter the total amount and other fields
    - Save the payment plan
    - Add installments to the payment plan

### Via API

1. Register a merchant user:
    ```bash
    curl -X POST http://localhost:8000/api/register/ \
    -H "Content-Type: application/json" \
    -d '{"username": "merchant1", "email": "merchant1@example.com", "password": "securepass123", "is_merchant": true}'
    ```

2. Register a customer user:
    ```bash
    curl -X POST http://localhost:8000/api/register/ \
    -H "Content-Type: application/json" \
    -d '{"username": "customer1", "email": "customer1@example.com", "password": "securepass123", "is_merchant": false}'
    ```

3. Get a JWT token for the merchant:
    ```bash
    curl -X POST http://localhost:8000/api/token/ \
    -H "Content-Type: application/json" \
    -d '{"username": "merchant1", "password": "securepass123"}'
    ```

4. Create a payment plan (replace ```<token>``` with the JWT token from step 3):
    ```bash
    curl -X POST http://localhost:8000/api/plans/ \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{
        "customer": 2,
        "total_amount": "1000.00",
        "description": "Test payment plan",
        "installments": [
        {"amount": "333.33", "due_date": "2025-06-01"},
        {"amount": "333.33", "due_date": "2025-07-01"},
        {"amount": "333.34", "due_date": "2025-08-01"}
        ]
    }'
    ```

### Via Demo Data Command
For convenience, you can also load demo data:
```bash
docker-compose exec backend python manage.py create_demo_data
```
#### This will create:

- 1 merchant user (username: merchant, password: merchant123)
- 3 customer users (usernames: customer1, customer2, customer3, password: customer123)
- 5 payment plans with various statuses and installments

#### Security Considerations
This application implements several security measures, but for a production environment, additional considerations are necessary:
#### Current Security Measures

- JWT Authentication: All API endpoints are protected with JWT token authentication
- Role-Based Access Control: Different user roles (merchant/customer) have appropriate permissions
- Input Validation: All user inputs are validated through serializers and form validation
- CSRF Protection: Django's built-in CSRF protection for forms
- Secure Password Storage: Passwords are hashed using Django's authentication system
- Environment Variable Handling: Sensitive configuration is managed through environment variables

### Production Security Enhancements
For a production payment API, consider these additional security measures:

- HTTPS Encryption: All API traffic should be encrypted with TLS/SSL
- API Rate Limiting: Implement rate limiting to prevent abuse and DDoS attacks
- Audit Logging: Comprehensive logging of all payment-related activities
- PCI DSS Compliance: For real payment processing, comply with Payment Card Industry Data Security Standards
- Multi-Factor Authentication: Implement MFA for merchant accounts
- IP Whitelisting: Restrict access to sensitive endpoints by IP
- Payment Tokenization: Use tokenization for sensitive payment information
- Regular Security Audits: Conduct penetration testing and code reviews
- Real-time Fraud Detection: Implement fraud detection algorithms for payment transactions
- Data Retention Policies: Clear policies on storage and disposal of sensitive data

### Design Trade-offs

- Simplified Payment Processing: This implementation uses a simplified payment process without integrating real payment gateways to focus on the core BNPL functionality.
- Limited Validation Rules: The validation for payment plans and installments is basic and could be enhanced with more sophisticated business rules in a production environment.
- In-memory Session Store: For simplicity, we're using Redis for session storage rather than implementing a more complex distributed session system.
- Monolithic Architecture: The application is structured as a monolith for simplicity, though a microservices approach might be more appropriate for a production BNPL system.
- Limited Customer Verification: A production BNPL system would require more robust KYC (Know Your Customer) verification processes.

### License
This project is licensed under the MIT License - see the LICENSE file for details.
