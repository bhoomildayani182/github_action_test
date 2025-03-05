# ---- Stage 1: Build ----
FROM node:20-alpine3.19 AS builder

# Update Alpine packages to fix vulnerabilities
RUN apk update && \
    apk upgrade --no-cache && \
    npm install -g npm@10.9.0 && \
    # Remove old version
    npm uninstall -g cross-spawn && \
    npm cache clean --force && \
    # Find and remove any remaining old versions
    find /usr/local/lib/node_modules -name "cross-spawn" -type d -exec rm -rf {} + && \
    # Install new version
    npm install -g cross-spawn@7.0.5 --force && \
    # Configure npm
    npm config set save-exact=true && \
    npm config set legacy-peer-deps=true

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install production dependencies
RUN npm install

# RUN npm install --production
# Copy only the necessary source files
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm install @nestjs/cli

# Build the NestJS application
RUN npm run build

# ---- Stage 2: Run ----
FROM node:20-alpine3.19 AS runner

# Update Alpine packages to fix vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Copy built files and node_modules from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

RUN npm install -g npm@10.9.0 && \
    # Remove old version
    npm uninstall -g cross-spawn && \
    npm cache clean --force && \
    # Find and remove any remaining old versions
    find /usr/local/lib/node_modules -name "cross-spawn" -type d -exec rm -rf {} + && \
    # Install new version
    npm install -g cross-spawn@7.0.5 --force && \
    # Configure npm
    npm config set save-exact=true && \
    npm config set legacy-peer-deps=true

# Run the application
CMD ["node", "dist/main.js"]
