FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir pika==1.3.2 websockets==12.0
COPY defora_cli /app/defora_cli
CMD ["python", "-m", "defora_cli.control_bridge"]
