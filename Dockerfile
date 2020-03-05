FROM node:12-alpine as frontend-builder
WORKDIR /opt/webapp
COPY vue-src/package*.json ./
RUN npm install
COPY vue-src/ ./
RUN npm run build

FROM node:10-alpine
WORKDIR /opt/webapp
COPY src/package*.json ./
ENV NODE_ENV=dev
RUN npm install
COPY src/ .
COPY --from=frontend-builder /opt/webapp/dist/ ./public/
CMD npm run start
