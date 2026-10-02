FROM python:3.12-slim

# Remove --no-create-home so gunicorn can access /home/appuser for control server
RUN adduser --disabled-password appuser

WORKDIR /app
RUN chown appuser:appuser /app

USER appuser
ENV PATH="/home/appuser/.local/bin:${PATH}"

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

EXPOSE 8000

# Using bash/sh entrypoint to chain migrations and start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_data && gunicorn lead_desk.wsgi:application --bind 0.0.0.0:8000"]