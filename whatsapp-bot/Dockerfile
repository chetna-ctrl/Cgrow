# Node.js + Chromium (Puppeteer ke liye) base image
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Root user set karo (Puppeteer image default non-root hai)
USER root

# App directory
WORKDIR /app

# Dependencies pehle copy karo (Docker cache optimize)
COPY package*.json ./

# Production dependencies only
RUN npm install --omit=dev

# Source code copy karo
COPY . .

# Port expose karo
EXPOSE 3001

# Bot start karo
CMD ["node", "index.js"]
