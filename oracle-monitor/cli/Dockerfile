FROM python:3.11-slim

WORKDIR /app

COPY cli/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY cli/ /app/cli/
COPY schema/ /app/schema/

WORKDIR /app/cli
RUN pip install -e .

ENTRYPOINT ["oracle-monitor"]
