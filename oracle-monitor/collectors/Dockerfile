FROM python:3.11-slim

WORKDIR /app

COPY collectors/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all collector code
COPY collectors/ /app/collectors/
COPY schema/ /app/schema/

ENV PYTHONPATH=/app

CMD ["python", "-m", "collectors.main"]
