# Hysio V2 Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Hysio V2 in production environments, covering infrastructure setup, security configuration, scaling strategies, and operational procedures for healthcare compliance.

**Target Audience**: DevOps Engineers, System Administrators, Healthcare IT Professionals
**Compliance Level**: HIPAA, GDPR/AVG, SOC 2 Type II

## Table of Contents

- [Prerequisites](#prerequisites)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Security Configuration](#security-configuration)
- [Environment Setup](#environment-setup)
- [Database Deployment](#database-deployment)
- [Application Deployment](#application-deployment)
- [Load Balancing and SSL](#load-balancing-and-ssl)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Disaster Recovery](#backup-and-disaster-recovery)
- [Scaling Strategies](#scaling-strategies)
- [Maintenance Procedures](#maintenance-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Expertise
- **Healthcare Compliance**: Understanding of HIPAA, GDPR, and medical data protection
- **Container Orchestration**: Docker, Kubernetes, or equivalent
- **Database Administration**: PostgreSQL administration and optimization
- **Security Operations**: SSL/TLS, secrets management, network security
- **Monitoring**: Application and infrastructure monitoring setup

### Required Tools
- **Container Runtime**: Docker 20.x+ or containerd
- **Orchestration**: Kubernetes 1.24+ or Docker Swarm
- **CI/CD**: GitHub Actions (configured) or Jenkins
- **Infrastructure as Code**: Terraform, CloudFormation, or Pulumi
- **Secrets Management**: HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault
- **Monitoring**: Prometheus, Grafana, ELK Stack

## Infrastructure Requirements

### Minimum Production Requirements

#### Application Servers
```yaml
CPU: 4 vCPUs (8 vCPUs recommended)
Memory: 8 GB RAM (16 GB recommended)
Storage: 50 GB SSD (100 GB recommended)
Network: 1 Gbps bandwidth
OS: Ubuntu 20.04 LTS or RHEL 8+
```

#### Database Servers
```yaml
CPU: 8 vCPUs (16 vCPUs for high-load)
Memory: 16 GB RAM (32 GB for high-load)
Storage: 500 GB SSD (NVMe preferred)
IOPS: 3000 minimum (10000+ recommended)
Network: 10 Gbps bandwidth
Backup Storage: 3x database size
```

#### Load Balancer/Reverse Proxy
```yaml
CPU: 2 vCPUs
Memory: 4 GB RAM
Storage: 20 GB SSD
Network: 10 Gbps bandwidth
SSL Termination: Hardware or software-based
```

### High Availability Architecture

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │    (HAProxy)    │
                    └─────────┬───────┘
                              │
                    ┌─────────┼───────┐
                    │                 │
          ┌─────────▼──────┐ ┌────────▼──────┐
          │  App Server 1  │ │  App Server 2 │
          │   (Primary)    │ │  (Secondary)  │
          └─────────┬──────┘ └────────┬──────┘
                    │                 │
                    └─────────┬───────┘
                              │
                   ┌──────────▼──────────┐
                   │   Database Cluster  │
                   │  (Primary/Replica)  │
                   └─────────────────────┘
```

### Cloud Provider Configurations

#### AWS Architecture
```yaml
Region: Multi-region setup (us-east-1, us-west-2)
VPC: Custom VPC with private/public subnets
Compute: EC2 instances (m5.xlarge or larger)
Database: RDS PostgreSQL Multi-AZ
Load Balancer: Application Load Balancer (ALB)
Storage: EBS GP3 volumes
CDN: CloudFront for static assets
DNS: Route 53 with health checks
Secrets: AWS Secrets Manager
Monitoring: CloudWatch + custom metrics
```

#### Azure Architecture
```yaml
Region: Multi-region setup
Network: Virtual Network with subnets
Compute: Virtual Machines (Standard D4s v3)
Database: Azure Database for PostgreSQL
Load Balancer: Azure Load Balancer + Application Gateway
Storage: Premium SSD managed disks
CDN: Azure CDN
DNS: Azure DNS
Secrets: Azure Key Vault
Monitoring: Azure Monitor + Log Analytics
```

#### GCP Architecture
```yaml
Region: Multi-region setup
Network: VPC with custom subnets
Compute: Compute Engine (n2-standard-4)
Database: Cloud SQL for PostgreSQL
Load Balancer: Google Cloud Load Balancing
Storage: SSD persistent disks
CDN: Cloud CDN
DNS: Cloud DNS
Secrets: Secret Manager
Monitoring: Cloud Monitoring + Logging
```

## Security Configuration

### Network Security

#### Firewall Rules
```bash
# Application servers (internal only)
PORT 3000: Allow from load balancer only
PORT 22: Allow from bastion host only
PORT 443: Allow from load balancer only

# Database servers (internal only)
PORT 5432: Allow from application servers only
PORT 22: Allow from bastion host only

# Load balancer (public-facing)
PORT 80: Allow from 0.0.0.0/0 (redirect to 443)
PORT 443: Allow from 0.0.0.0/0
PORT 22: Allow from management network only
```

#### VPN Configuration
```yaml
Type: Site-to-site VPN for admin access
Protocol: IPSec or WireGuard
Encryption: AES-256
Authentication: Certificate-based
Access Control: Role-based access to different network segments
```

### SSL/TLS Configuration

#### SSL Certificate Setup
```bash
# Using Let's Encrypt with automatic renewal
certbot certonly --nginx \
  --domains hysio.com,api.hysio.com \
  --email admin@hysio.com \
  --agree-tos \
  --non-interactive

# Certificate renewal automation
echo "0 3 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### TLS Configuration
```nginx
# nginx.conf - Strong TLS configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS header for healthcare compliance
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Secrets Management

#### Environment Variables
```bash
# Production environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@db:5432/hysio_prod"
export REDIS_URL="redis://redis-cluster:6379"
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
export ENCRYPTION_KEY="$(openssl rand -base64 32)"
export JWT_SECRET="$(openssl rand -base64 32)"
export SESSION_SECRET="$(openssl rand -base64 32)"
```

#### HashiCorp Vault Integration
```hcl
# vault-policy.hcl
path "secret/hysio/*" {
  capabilities = ["read"]
}

path "database/creds/hysio-role" {
  capabilities = ["read"]
}
```

## Environment Setup

### Docker Production Environment

#### Production Dockerfile Optimization
```dockerfile
# Multi-stage build with security hardening
FROM node:18-alpine AS production

# Security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["dumb-init", "node", "server.js"]
```

### Kubernetes Deployment

#### Application Deployment
```yaml
# k8s/hysio-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hysio-medical-scribe
  namespace: hysio-prod
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: hysio-medical-scribe
  template:
    metadata:
      labels:
        app: hysio-medical-scribe
    spec:
      containers:
      - name: hysio-medical-scribe
        image: ghcr.io/hysio/medical-scribe:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hysio-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service Configuration
```yaml
# k8s/hysio-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: hysio-service
  namespace: hysio-prod
spec:
  selector:
    app: hysio-medical-scribe
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Database Deployment

### PostgreSQL Production Setup

#### High Availability Configuration
```postgresql
-- postgresql.conf production settings
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.7
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

-- Logging for healthcare compliance
log_statement = 'all'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

-- SSL configuration
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'
ssl_prefer_server_ciphers = on
```

#### Database Initialization
```sql
-- Create production database
CREATE DATABASE hysio_prod WITH
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE = template0;

-- Create application user
CREATE USER hysio_app WITH
  PASSWORD 'secure_password_here'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE hysio_prod TO hysio_app;
GRANT USAGE ON SCHEMA public TO hysio_app;
GRANT CREATE ON SCHEMA public TO hysio_app;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### Backup Configuration
```bash
#!/bin/bash
# backup-database.sh

set -e

# Configuration
DB_NAME="hysio_prod"
DB_USER="hysio_app"
BACKUP_DIR="/backups/postgresql"
RETENTION_DAYS=30
S3_BUCKET="hysio-backups"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/hysio_backup_$TIMESTAMP.sql.gz"

# Create backup
pg_dump \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --format=custom | gzip > "$BACKUP_FILE"

# Upload to S3 (if configured)
if [ ! -z "$S3_BUCKET" ]; then
  aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/database/"
fi

# Clean old backups
find "$BACKUP_DIR" -name "hysio_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
```

## Application Deployment

### CI/CD Pipeline Deployment

#### GitHub Actions Production Deploy
```bash
# Deploy script called by GitHub Actions
#!/bin/bash

set -e

# Configuration
DOCKER_IMAGE="ghcr.io/hysio/medical-scribe:$1"
DEPLOYMENT_NAME="hysio-medical-scribe"
NAMESPACE="hysio-prod"

echo "Deploying $DOCKER_IMAGE to production..."

# Update Kubernetes deployment
kubectl set image deployment/$DEPLOYMENT_NAME \
  hysio-medical-scribe=$DOCKER_IMAGE \
  --namespace=$NAMESPACE

# Wait for rollout to complete
kubectl rollout status deployment/$DEPLOYMENT_NAME \
  --namespace=$NAMESPACE \
  --timeout=300s

# Verify deployment
kubectl get pods -l app=hysio-medical-scribe \
  --namespace=$NAMESPACE

echo "Deployment completed successfully"
```

### Blue-Green Deployment

#### Blue-Green Strategy
```bash
#!/bin/bash
# blue-green-deploy.sh

set -e

NEW_VERSION=$1
CURRENT_ENV=$(kubectl get service hysio-service -o jsonpath='{.spec.selector.version}')

if [ "$CURRENT_ENV" = "blue" ]; then
  NEW_ENV="green"
else
  NEW_ENV="blue"
fi

echo "Current environment: $CURRENT_ENV"
echo "Deploying to: $NEW_ENV"

# Deploy to new environment
kubectl apply -f k8s/hysio-deployment-$NEW_ENV.yaml
kubectl set image deployment/hysio-$NEW_ENV \
  hysio-medical-scribe=ghcr.io/hysio/medical-scribe:$NEW_VERSION

# Wait for new deployment to be ready
kubectl rollout status deployment/hysio-$NEW_ENV --timeout=300s

# Run health checks
kubectl exec deployment/hysio-$NEW_ENV -- wget -q --spider http://localhost:3000/api/health

# Switch traffic
kubectl patch service hysio-service -p '{"spec":{"selector":{"version":"'$NEW_ENV'"}}}'

echo "Traffic switched to $NEW_ENV environment"

# Clean up old environment (optional)
# kubectl delete deployment hysio-$CURRENT_ENV
```

## Load Balancing and SSL

### HAProxy Configuration

#### Production HAProxy Setup
```haproxy
# /etc/haproxy/haproxy.cfg
global
    daemon
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy

    # SSL/TLS configuration
    ssl-default-bind-ciphers ECDHE+aRSA+AESGCM:ECDHE+aRSA+SHA384:ECDHE+aRSA+SHA256:!aNULL:!MD5:!DSS
    ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull
    option log-health-checks

frontend hysio_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/hysio.pem

    # Redirect HTTP to HTTPS
    redirect scheme https if !{ ssl_fc }

    # Security headers
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    http-response set-header X-Frame-Options "SAMEORIGIN"
    http-response set-header X-Content-Type-Options "nosniff"
    http-response set-header X-XSS-Protection "1; mode=block"

    # Health check endpoint
    acl health_check path_beg /health
    use_backend health_backend if health_check

    default_backend hysio_backend

backend hysio_backend
    balance roundrobin
    option httpchk GET /api/health

    server app1 10.0.1.10:3000 check
    server app2 10.0.1.11:3000 check
    server app3 10.0.1.12:3000 check

backend health_backend
    http-request return status 200 content-type text/plain string "OK"

listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

### Nginx Configuration

#### Production Nginx Setup
```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Security
    server_tokens off;
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    upstream hysio_backend {
        least_conn;
        server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
        server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
        server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 80;
        server_name hysio.com www.hysio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name hysio.com www.hysio.com;

        # SSL configuration
        ssl_certificate /etc/ssl/certs/hysio.crt;
        ssl_certificate_key /etc/ssl/private/hysio.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Health check
        location /nginx-health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://hysio_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://hysio_backend;
        }

        # Main application
        location / {
            proxy_pass http://hysio_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

## Monitoring and Logging

### Prometheus Configuration

#### Prometheus Setup
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "hysio_rules.yml"

scrape_configs:
  - job_name: 'hysio-app'
    static_configs:
      - targets: ['app1:3000', 'app2:3000', 'app3:3000']
    metrics_path: /api/metrics
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node1:9100', 'node2:9100', 'node3:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### Alert Rules
```yaml
# hysio_rules.yml
groups:
  - name: hysio_alerts
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds_p95 > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "Response time is above 2 seconds"

      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connections high"
          description: "Database connections are above 80%"

      - alert: ApplicationDown
        expr: up{job="hysio-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application instance down"
          description: "Hysio application instance is not responding"
```

### Logging Configuration

#### Structured Logging Setup
```javascript
// logger.js - Application logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hysio-medical-scribe',
    version: process.env.VERSION || 'unknown',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.File({
      filename: '/app/logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: '/app/logs/app.log'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Healthcare-specific audit logging
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hysio-audit',
    compliance: 'HIPAA'
  },
  transports: [
    new winston.transports.File({
      filename: '/app/logs/audit.log'
    })
  ]
});

module.exports = { logger, auditLogger };
```

## Backup and Disaster Recovery

### Backup Strategy

#### Automated Backup System
```bash
#!/bin/bash
# comprehensive-backup.sh

set -e

# Configuration
BACKUP_ROOT="/backups"
RETENTION_DAYS=30
S3_BUCKET="hysio-disaster-recovery"

# Database backup
echo "Starting database backup..."
pg_dump \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_ROOT/db_$(date +%Y%m%d_%H%M%S).backup"

# File system backup
echo "Starting file system backup..."
tar -czf "$BACKUP_ROOT/files_$(date +%Y%m%d_%H%M%S).tar.gz" \
  /app/uploads \
  /app/logs \
  /etc/nginx \
  /etc/ssl

# Configuration backup
echo "Starting configuration backup..."
kubectl get all -n hysio-prod -o yaml > "$BACKUP_ROOT/k8s_$(date +%Y%m%d_%H%M%S).yaml"

# Upload to S3
echo "Uploading backups to S3..."
aws s3 sync "$BACKUP_ROOT" "s3://$S3_BUCKET/$(date +%Y%m%d)/"

# Cleanup old backups
find "$BACKUP_ROOT" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully"
```

### Disaster Recovery Plan

#### Recovery Procedures
```bash
#!/bin/bash
# disaster-recovery.sh

set -e

BACKUP_DATE=$1
S3_BUCKET="hysio-disaster-recovery"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 YYYYMMDD"
  exit 1
fi

echo "Starting disaster recovery for $BACKUP_DATE..."

# Download backups from S3
aws s3 sync "s3://$S3_BUCKET/$BACKUP_DATE/" "/tmp/recovery/"

# Restore database
echo "Restoring database..."
pg_restore \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --clean \
  --create \
  "/tmp/recovery/db_*.backup"

# Restore file system
echo "Restoring file system..."
tar -xzf "/tmp/recovery/files_*.tar.gz" -C /

# Restore Kubernetes configuration
echo "Restoring Kubernetes configuration..."
kubectl apply -f "/tmp/recovery/k8s_*.yaml"

echo "Disaster recovery completed"
```

## Scaling Strategies

### Horizontal Scaling

#### Auto-scaling Configuration
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hysio-hpa
  namespace: hysio-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hysio-medical-scribe
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### Database Scaling

#### Read Replica Setup
```sql
-- Primary database configuration
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET wal_keep_segments = 64;
SELECT pg_reload_conf();

-- Create replication user
CREATE USER replicator REPLICATION LOGIN CONNECTION LIMIT 5 ENCRYPTED PASSWORD 'secure_password';
```

#### Connection Pooling
```yaml
# pgbouncer configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: pgbouncer-config
data:
  pgbouncer.ini: |
    [databases]
    hysio_prod = host=postgres port=5432 dbname=hysio_prod

    [pgbouncer]
    listen_port = 6432
    listen_addr = *
    auth_type = md5
    auth_file = /etc/pgbouncer/userlist.txt
    pool_mode = transaction
    max_client_conn = 1000
    default_pool_size = 20
    reserve_pool_size = 5
    server_lifetime = 3600
    server_idle_timeout = 600
```

## Maintenance Procedures

### Rolling Updates

#### Zero-Downtime Deployment
```bash
#!/bin/bash
# rolling-update.sh

set -e

NEW_IMAGE=$1
DEPLOYMENT="hysio-medical-scribe"
NAMESPACE="hysio-prod"

if [ -z "$NEW_IMAGE" ]; then
  echo "Usage: $0 <docker-image>"
  exit 1
fi

echo "Starting rolling update to $NEW_IMAGE..."

# Update deployment
kubectl set image deployment/$DEPLOYMENT \
  hysio-medical-scribe=$NEW_IMAGE \
  --namespace=$NAMESPACE

# Wait for rollout
kubectl rollout status deployment/$DEPLOYMENT \
  --namespace=$NAMESPACE \
  --timeout=600s

# Verify deployment
kubectl get pods -l app=hysio-medical-scribe \
  --namespace=$NAMESPACE

# Run post-deployment tests
kubectl run --rm -i --tty test-pod \
  --image=curlimages/curl \
  --restart=Never \
  -- curl -f http://hysio-service/api/health

echo "Rolling update completed successfully"
```

### Database Maintenance

#### Maintenance Scripts
```sql
-- Regular maintenance queries
-- Analyze table statistics
ANALYZE;

-- Update planner statistics
SELECT pg_stat_reset();

-- Check for bloated tables
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  n_dead_tup::float / (n_live_tup + n_dead_tup) * 100 AS dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;

-- Vacuum and reindex (schedule during maintenance window)
VACUUM ANALYZE;
REINDEX DATABASE hysio_prod;
```

### Security Updates

#### Security Patch Management
```bash
#!/bin/bash
# security-updates.sh

set -e

echo "Starting security updates..."

# Update base OS packages
apt update && apt upgrade -y

# Update Node.js dependencies
cd /app && npm audit fix

# Update Docker base images
docker pull node:18-alpine
docker pull postgres:15-alpine
docker pull nginx:alpine

# Rebuild application image
docker build -t hysio-medical-scribe:security-$(date +%Y%m%d) .

echo "Security updates completed"
```

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check application logs
kubectl logs deployment/hysio-medical-scribe -n hysio-prod

# Check events
kubectl get events -n hysio-prod --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top pods -n hysio-prod

# Check configuration
kubectl describe deployment hysio-medical-scribe -n hysio-prod
```

#### Database Connection Issues
```sql
-- Check current connections
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  query
FROM pg_stat_activity
WHERE state = 'active';

-- Check for blocking queries
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

#### Performance Issues
```bash
# Check system resources
htop
iostat -x 1
netstat -tulpn

# Check application metrics
curl http://localhost:3000/api/metrics

# Check database performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Emergency Procedures

#### Emergency Rollback
```bash
#!/bin/bash
# emergency-rollback.sh

set -e

DEPLOYMENT="hysio-medical-scribe"
NAMESPACE="hysio-prod"

echo "Starting emergency rollback..."

# Rollback to previous version
kubectl rollout undo deployment/$DEPLOYMENT \
  --namespace=$NAMESPACE

# Wait for rollback to complete
kubectl rollout status deployment/$DEPLOYMENT \
  --namespace=$NAMESPACE \
  --timeout=300s

# Verify rollback
kubectl get pods -l app=hysio-medical-scribe \
  --namespace=$NAMESPACE

echo "Emergency rollback completed"
```

## Support and Documentation

### Support Contacts
- **Technical Support**: tech@hysio.com
- **Security Issues**: security@hysio.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX

### Additional Resources
- [API Documentation](./API_DOCUMENTATION.md)
- [Security Policy](./SECURITY.md)
- [Compliance Framework](./COMPLIANCE.md)
- [Monitoring Guide](./MONITORING.md)

---

**Last Updated**: [Current Date]
**Document Version**: 1.0
**Next Review**: [Date + 3 months]

*This deployment guide is maintained by the Hysio DevOps team and updated quarterly to reflect current best practices and security requirements.*