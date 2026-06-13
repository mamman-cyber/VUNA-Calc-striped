# ---- Stage 1: Build and validate ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run lint && npm test

# ---- Stage 2: Serve static files ----
FROM nginx:alpine AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/vuna-calc.conf
COPY --from=builder /app/index.html /app/assets /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
