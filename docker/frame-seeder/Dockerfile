FROM python:3.11-slim

WORKDIR /app

# Install pillow for image generation
RUN pip install --no-cache-dir pillow

COPY docker/frame-seeder/seeder.py /app/seeder.py

ENV OUTPUT_DIR=/data/frames \
    FPS=12 \
    CLEAR=0

CMD ["python", "seeder.py"]
