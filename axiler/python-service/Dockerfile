# Use Python 3.12 slim image for smaller size
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose the gRPC port
EXPOSE 50051

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import grpc; import chatbot_pb2_grpc; import chatbot_pb2; \
    channel = grpc.insecure_channel('localhost:50051'); \
    stub = chatbot_pb2_grpc.ChatbotServiceStub(channel); \
    request = chatbot_pb2.HealthCheckRequest(); \
    response = stub.HealthCheck(request); \
    exit(0 if response.status == 'SERVING' else 1)" || exit 1

# Default command to run the gRPC server
CMD ["python", "grpc_server.py"]