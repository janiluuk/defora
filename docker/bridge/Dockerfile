FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir pika==1.3.2 websockets==12.0
COPY sd_cli /app/sd_cli
CMD ["python", "-m", "sd_cli.control_bridge"]
