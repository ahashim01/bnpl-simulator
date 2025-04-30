# BNPL Payment Plan Simulator

A web-based Buy Now, Pay Later (BNPL) dashboard that allows merchants to create payment plans and customers to view and manage their installments.

## Features

### Merchant Features
- Create BNPL payment plans by specifying:
  - Total amount
  - Customer email
  - Number of installments
  - Start date
- View comprehensive analytics dashboard with:
  - Total revenue
  - Collected revenue
  - Pending revenue
  - Success rate
  - Total plans
  - Active plans
  - Overdue installments
- Monitor payment plans and installment statuses

### Customer Features
- Overview dashboard with payment summary
  - Active payment plans
  - Total amount paid
  - Remaining amount to pay
- Next payment notification
- Detailed view of all payment plans with progress indicators
- Upcoming installments section
- Payment history section
- Pay installments with a simple button click

### Technical Features
- Automatic installment calculation with proper rounding
- Due date calculation (monthly intervals)
- Status tracking (Pending, Paid, Late)
- Automatic detection of overdue payments
- Email notifications for upcoming and overdue payments
- Progress tracking for payment plans

## Technology Stack

### Backend
- Django / Django REST Framework
- PostgreSQL (SQLite for development)
- Celery for background tasks
- JWT authentication

### Frontend
- React
- Material UI
- React Query for data fetching
- dayjs for date handling

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 16+
- Redis (for Celery)

### Backend Setup
1. Clone the repository
   ```
   git clone <repository-url>
   cd bnpl-simulator
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Run migrations
   ```
   python manage.py migrate
   ```

5. Create a superuser
   ```
   python manage.py createsuperuser
   ```

6. Run the development server
   ```
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

### Running Background Tasks (Optional)
1. Start Redis server (if not already running)
   ```
   redis-server
   ```

2. Start Celery worker
   ```
   celery -A config worker -l info
   ```

3. Start Celery beat for scheduled tasks
   ```
   celery -A config beat -l info
   ```

## Securing Payment APIs in Production

For a production deployment of this BNPL system, several additional security measures would be necessary:

1. **HTTPS Only** - All API communications must be encrypted using TLS/SSL.

2. **API Authentication**
   - Use OAuth 2.0 with refresh tokens
   - Implement token expiration and rotation
   - Use proper scopes for different API endpoints

3. **Data Security**
   - Encrypt sensitive data at rest (payment details, user information)
   - Implement proper data sanitization and validation
   - Use parameterized queries to prevent SQL injection

4. **PCI DSS Compliance**
   - For real payment processing, ensure PCI DSS compliance
   - Consider using a trusted payment gateway (like Stripe, PayPal) rather than handling payments directly
   - Tokenize payment information

5. **Rate Limiting and Throttling**
   - Implement rate limiting to prevent brute force attacks
   - Add request throttling to prevent DoS attacks

6. **Monitoring and Logging**
   - Implement comprehensive logging for security events
   - Set up real-time monitoring for suspicious activities
   - Deploy intrusion detection systems

7. **Input Validation**
   - Strict validation of all input data
   - Escaping all output to prevent XSS attacks
   - Implementing CSRF protection

8. **Secure Deployment**
   - Use container security scanning
   - Implement network segmentation
   - Regular security audits and penetration testing

9. **API Testing**
   - Automated security testing in CI/CD pipeline
   - Regular vulnerability scanning

## Trade-offs and Limitations

- **Payment Processing**: This is a simulator only and doesn't integrate with actual payment gateways.
- **Date Validation**: Simplified date validation due to time constraints.
- **Email Notifications**: Using mock emails rather than actual delivery service.
- **Authentication**: Basic JWT authentication without refresh tokens or password reset functionality.
- **Mobile Responsiveness**: The UI is functional on mobile but optimized for desktop.
- **Analytics**: Basic analytics implementation focused on essential metrics.

## Future Improvements

- Integration with real payment gateways
- Enhanced customer onboarding with KYC verification
- Mobile application for customers
- Advanced fraud detection system
- Multi-language and currency support
- Custom installment plans (uneven amounts, variable payment dates)
- Merchant customer management system
