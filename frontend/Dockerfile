FROM node:22-alpine AS builder

WORKDIR /app

ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache curl \
    && addgroup -S web && adduser -S web -G web

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R web:web /usr/share/nginx/html \
    && sed -i 's/user  nginx;/user  web;/' /etc/nginx/nginx.conf \
    && touch /var/run/nginx.pid \
    && chown -R web:web /var/run/nginx.pid /var/cache/nginx

USER web

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
