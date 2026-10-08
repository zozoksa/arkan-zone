# Arkan Zone web (static build served by nginx, which also proxies /api to the API)
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ARG VITE_GA_ID=
ARG VITE_CLARITY_ID=
ENV VITE_API_URL=$VITE_API_URL VITE_GA_ID=$VITE_GA_ID VITE_CLARITY_ID=$VITE_CLARITY_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
