#!/usr/bin/env node
const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const amqp = require("amqplib");

const app = express();
const PORT = process.env.PORT || 80;
const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";
const CONTROL_TOKEN = process.env.CONTROL_TOKEN || "";
const QUEUE = "controls";

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
  console.log(`[web] Listening on ${PORT}`);
});

const wss = new WebSocket.Server({ server });

let amqpConn = null;
let channel = null;

async function setupQueue() {
  try {
    amqpConn = await amqp.connect(RABBIT_URL);
    channel = await amqpConn.createChannel();
    await channel.assertQueue(QUEUE, { durable: false });
    console.log("[mq] Connected to RabbitMQ");
  } catch (err) {
    console.error("[mq] connection failed", err);
  }
}

setupQueue();

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", msg: "Connected to sd-cli web control" }));

  ws.on("message", async (raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      if (payload.type !== "control") return;
      if (CONTROL_TOKEN && payload.token !== CONTROL_TOKEN) {
        ws.send(JSON.stringify({ type: "error", msg: "unauthorized" }));
        return;
      }
      if (!payload.controlType || typeof payload.payload !== "object") {
        ws.send(JSON.stringify({ type: "error", msg: "invalid schema" }));
        return;
      }
      const msg = { controlType: payload.controlType, payload: payload.payload };
      if (channel) {
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)));
      }
      // echo to all listeners
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "event", msg: "control forwarded", payload: msg }));
        }
      });
    } catch (err) {
      console.error("bad ws message", err);
    }
  });
});
