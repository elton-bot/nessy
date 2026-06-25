# Alternative to the Render Blueprint: a single container running the whole app
# (Express API + SSE + built SPA). Works on Fly.io, Railway, Cloud Run, etc.
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 5181
CMD ["npm", "start"]
