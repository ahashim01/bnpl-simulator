# backend/Dockerfile
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Set work directory
WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install uv \
 && uv pip install -r requirements.lock

# Copy project
COPY . .

# Make entrypoint script executable
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]

# Command to run the server
CMD ["uvicorn", "config.asgi:application", "--host", "0.0.0.0", "--loop", "uvloop", "--http", "httptools", "--reload"]
