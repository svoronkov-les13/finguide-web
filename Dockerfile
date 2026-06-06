FROM oven/bun:1.3.6 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_FINGUIDE_BASE_PATH=/fg/
ARG VITE_FINGUIDE_AUTH_ENABLED=true
ARG VITE_FINGUIDE_OIDC_ISSUER_URL=https://finguide.les13.tech/auth/realms/finguide
ARG VITE_FINGUIDE_OIDC_CLIENT_ID=finguide-web
ARG VITE_FINGUIDE_OIDC_SCOPE="openid profile email"
ARG VITE_FINGUIDE_API_BASE_URL=/finguide-api/api/v1
RUN ./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/fg
EXPOSE 8080
