FROM python:3.9-slim-bullseye

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /src

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000

COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
