# Why this file is written:
# This Dockerfile containerizes the React frontend using a multi-stage build.
# Stage 1: Builds the production bundles using node:18-alpine.
# Stage 2: Copies the built output to Nginx to serve the pages on port 80, 
# configuring try_files to support React Router SPA routing paths.

# Stage 1: Build React Production Bundles
FROM node:18-alpine AS build-stage

WORKDIR /app

# Define VITE_API_URL build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:stable-alpine AS production-stage

# Copy production build outputs
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Overwrite default Nginx configuration to support Single Page Application (SPA) routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
