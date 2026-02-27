FROM python:3.11-slim

WORKDIR /app

# Copy project files
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8002

# Run agent
CMD ["adk", "api_server", "--port", "8002"]
