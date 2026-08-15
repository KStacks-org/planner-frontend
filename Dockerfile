# 1. Use an official Node.js runtime as a parent image
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Enable pnpm (Corepack is included in Node.js >=16.10)
RUN corepack enable

# 4. Copy package.json and pnpm-lock.yaml first
COPY package.json pnpm-lock.yaml* ./

# 5. Install dependencies
RUN pnpm install --frozen-lockfile

# 6. Copy the rest of the application code
COPY . .

RUN pnpm run build

# 7. Expose the port
EXPOSE 3000

# 8. Serve the built app
CMD ["npx", "vite", "preview", "--port", "3000", "--host"]
