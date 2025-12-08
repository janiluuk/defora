FROM python:3.11-slim

WORKDIR /app

COPY deforumation/mediator.py /app/mediator.py
COPY docker/mediator/entrypoint.sh /entrypoint.sh

RUN pip install --no-cache-dir websockets==12.0 && \
    chmod +x /entrypoint.sh

ENV MEDIATOR_DEFORUM_ADDRESS=0.0.0.0 \
    MEDIATOR_DEFORUM_PORT=8765 \
    MEDIATOR_DEFORUMATION_ADDRESS=0.0.0.0 \
    MEDIATOR_DEFORUMATION_PORT=8766 \
    DEFORUMATION_ADDRESS=127.0.0.1 \
    DEFORUMATION_PORT=8767

EXPOSE 8765 8766

CMD ["/entrypoint.sh"]
