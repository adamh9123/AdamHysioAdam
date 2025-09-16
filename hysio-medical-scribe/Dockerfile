# Hysio Medical Scribe - Production Dockerfile
# Multi-stage build for optimized production image

# Build arguments
ARG NODE_VERSION=18
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# Base image for all stages
FROM node:${NODE_VERSION}-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Set working directory
WORKDIR /app

# Dependencies stage
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Development dependencies stage
FROM base AS deps-dev

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including dev dependencies
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Builder stage
FROM deps-dev AS builder

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production stage
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create necessary directories
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy package.json for metadata
COPY --chown=nextjs:nodejs package.json ./

# Create health check script
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
# Health check endpoint\n\
response=$(wget --no-verbose --tries=1 --spider --timeout=10 http://localhost:3000/api/health 2>&1 || echo "failed")\n\
\n\
if echo "$response" | grep -q "failed"; then\n\
  echo "Health check failed"\n\
  exit 1\n\
fi\n\
\n\
echo "Health check passed"\n\
exit 0\n\
' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh && \
    chown nextjs:nodejs /app/healthcheck.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["/app/healthcheck.sh"]

# Add labels for metadata
LABEL maintainer="Hysio Technologies <tech@hysio.com>" \
      org.opencontainers.image.title="Hysio Medical Scribe" \
      org.opencontainers.image.description="Enterprise healthcare platform for medical transcription and diagnosis support" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.vendor="Hysio Technologies" \
      org.opencontainers.image.licenses="Commercial" \
      org.opencontainers.image.documentation="https://github.com/hysio/medical-scribe/blob/main/README.md" \
      org.opencontainers.image.source="https://github.com/hysio/medical-scribe"

# Security labels
LABEL security.scan.enabled="true" \
      security.compliance.hipaa="true" \
      security.compliance.gdpr="true" \
      security.data.classification="healthcare"

# Start the application
CMD ["dumb-init", "node", "server.js"]

# Alternative CMD for development/debugging
# CMD ["dumb-init", "npm", "start"]

# =============================================================================
# Build Instructions:
# =============================================================================
#
# To build this image:
# docker build -t hysio-medical-scribe:latest .
#
# To build with build arguments:
# docker build \
#   --build-arg NODE_VERSION=18 \
#   --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
#   --build-arg VCS_REF=$(git rev-parse --short HEAD) \
#   --build-arg VERSION=v1.0.0 \
#   -t hysio-medical-scribe:v1.0.0 .
#
# To run the container:
# docker run -p 3000:3000 \
#   -e NODE_ENV=production \
#   -e DATABASE_URL=your_database_url \
#   -e NEXTAUTH_SECRET=your_secret \
#   hysio-medical-scribe:latest
#
# Security scan:
# docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
#   -v $(pwd):/root/.cache/ aquasec/trivy:latest image hysio-medical-scribe:latest
#
# =============================================================================