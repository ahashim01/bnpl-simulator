#!/bin/bash

# Create initial migration files and apply them
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create a superuser for the Django admin
docker-compose exec backend python manage.py createsuperuser

# Create sample data (optional)
docker-compose exec backend python manage.py create_sample_data
