# backend/Dockerfile
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Install uv using the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set work directory
WORKDIR /app

# Copy dependency definition files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies directly in this image
RUN uv pip install --system django celery redis
RUN uv pip install --system -e .

# Copy project files
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
