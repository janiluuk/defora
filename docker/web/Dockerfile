FROM node:20-alpine as builder
WORKDIR /app
COPY docker/web/package*.json ./
RUN npm install --quiet
COPY docker/web/ .
RUN npm run build

FROM alfg/nginx-rtmp:latest
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /app/public /usr/share/nginx/html/public
COPY --from=builder /app/node_modules /usr/share/nginx/html/node_modules
COPY docker/web/nginx.conf /etc/nginx/nginx.conf
COPY docker/web/server.js /usr/share/nginx/html/server.js
COPY docker/web/modules /usr/share/nginx/html/modules
COPY docker/web/gpu-pool.json /usr/share/nginx/html/gpu-pool.json
WORKDIR /usr/share/nginx/html
ENV NODE_PATH=/usr/share/nginx/html/node_modules
EXPOSE 80 1935
CMD ["sh", "-c", "PORT=3000 node server.js & nginx -g 'daemon off;'"]
