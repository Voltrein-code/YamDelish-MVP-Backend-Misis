FROM node:20-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN HUSKY=0 npm install --package-lock-only --ignore-scripts \
  && HUSKY=0 npm ci

COPY . .
RUN npm run build \
  && mkdir -p /app/data \
  && chown -R node:node /app

ENV NODE_ENV=production \
  HOSTNAME=0.0.0.0 \
  PORT=3000

USER node

EXPOSE 3000

CMD ["npm", "run", "docker:start"]
