FROM node:20-bullseye as builder
WORKDIR /app
COPY docker/web/package*.json ./
RUN npm install --quiet
COPY docker/web/ .
RUN npm run build || true

FROM alfg/nginx-rtmp:latest
COPY --from=builder /app/public /usr/share/nginx/html/public
COPY docker/web/nginx.conf /etc/nginx/nginx.conf
COPY docker/web/server.js /usr/share/nginx/html/server.js
WORKDIR /usr/share/nginx/html
RUN sed -i 's@#!/usr/bin/env node@#!/usr/local/bin/node@' server.js
EXPOSE 80 1935
CMD ["sh", "-c", "node server.js & nginx -g 'daemon off;'"]
