FROM alfg/nginx-rtmp:latest
COPY docker/stream/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80 1935
CMD ["nginx", "-g", "daemon off;"]
