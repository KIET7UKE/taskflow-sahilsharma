FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ARG VITE_USE_MSW

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
