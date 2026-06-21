# Deployment Guide

Complete guide for deploying SportsCaster to production.

## Prerequisites

- Node.js 20+ runtime
- npm 9+
- Docker (optional, for containerized deployment)
- Domain name with SSL (recommended for production)

---

## Docker Deployment (Recommended)

### Quick Start

```bash
# Build and start
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Docker Compose Configuration

The `docker-compose.yml` includes:

```yaml
version: '3.8'

services:
  sportscaster:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGINS=https://yourdomain.com
      - JWT_SECRET=your-production-secret
    volumes:
      - sportscaster-data:/app/server/data
    restart: unless-stopped

volumes:
  sportscaster-data:
```

### Dockerfile

Multi-stage build for optimized production images:

1. **Base stage** — Node.js 20 Alpine
2. **Client build** — Build React app
3. **Production stage** — Server with built client

### Environment Variables

Set in `docker-compose.yml` or `.env` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Server port (default: 3001) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `JWT_SECRET` | Yes | Strong random string for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 7d) |
| `ADMIN_TOKEN` | No | Legacy admin token for backward compatibility |

---

## Manual Deployment

### 1. Server Setup

```bash
# Clone repository
git clone <repository-url>
cd sportscaster

# Install server dependencies
cd server
npm ci --production

# Install client dependencies and build
cd ../client
npm ci
npm run build

# Return to root
cd ..
```

### 2. Configure Environment

Create `server/.env`:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=30d
```

### 3. Start Server

```bash
# Using Node.js directly
cd server
node src/index.js

# Or using npm
npm start
```

### 4. Process Management (PM2)

For production, use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start application
cd server
pm2 start src/index.js --name sportscaster

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

PM2 Commands:
```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart
pm2 stop all        # Stop
pm2 delete all      # Remove
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot

# Stop any running server on port 80
sudo systemctl stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificate locations
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot typically sets up a cron job automatically
# Verify with:
sudo crontab -l
```

---

## Reverse Proxy Configuration

### Nginx

Create `/etc/nginx/sites-available/sportscaster`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/sportscaster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache

Create `/etc/apache2/sites-available/sportscaster.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:3001/$1 [P,L]
</VirtualHost>
```

Enable required modules:

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite ssl
sudo a2ensite sportscaster
sudo systemctl reload apache2
```

---

## Backup and Recovery

### Data Files

SportsCaster stores data in JSON files:

```
server/data/
├── store.json         # Matches and teams
└── authStore.json     # Users, templates, scenes
```

### Automated Backup Script

Create `/usr/local/bin/sportscaster-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/sportscaster"
DATA_DIR="/path/to/sportscaster/server/data"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup data files
cp $DATA_DIR/store.json $BACKUP_DIR/store_$DATE.json
cp $DATA_DIR/authStore.json $BACKUP_DIR/authStore_$DATE.json

# Compress
tar -czf $BACKUP_DIR/sportscaster_$DATE.tar.gz \
    $BACKUP_DIR/store_$DATE.json \
    $BACKUP_DIR/authStore_$DATE.json

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "Backup completed: sportscaster_$DATE.tar.gz"
```

Make executable and schedule:

```bash
chmod +x /usr/local/bin/sportscaster-backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# 0 2 * * * /usr/local/bin/sportscaster-backup.sh
```

### Manual Backup

```bash
# Stop the server
pm2 stop sportscaster

# Backup data
cp -r server/data /backup/sportscaster/data

# Restart server
pm2 start sportscaster
```

### Recovery

```bash
# Stop the server
pm2 stop sportscaster

# Restore data
cp /backup/sportscaster/data/store.json server/data/
cp /backup/sportscaster/data/authStore.json server/data/

# Restart server
pm2 start sportscaster
```

### Docker Backup

```bash
# Backup volume
docker run --rm -v sportscaster-sportscaster-data:/data -v $(pwd):/backup alpine \
    tar -czf /backup/sportscaster-data.tar.gz -C /data .

# Restore volume
docker run --rm -v sportscaster-sportscaster-data:/data -v $(pwd):/backup alpine \
    tar -xzf /backup/sportscaster-data.tar.gz -C /data
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Configure `CORS_ORIGINS` for your domain
- [ ] Setup SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Enable process manager (PM2)
- [ ] Setup automated backups
- [ ] Configure firewall rules
- [ ] Monitor server logs
- [ ] Test WebSocket connectivity
- [ ] Verify overlay URLs work in OBS

---

## Scaling Considerations

### Single Server

For most local tournaments, a single server is sufficient:

- 1 CPU, 1GB RAM minimum
- SSD storage recommended
- Stable network connection

### Multiple Servers

For larger deployments, consider:

1. **Load Balancer** — Distribute traffic across servers
2. **Redis** — Shared session state and pub/sub
3. **Database** — PostgreSQL for persistent storage
4. **CDN** — Static asset delivery

### Performance Tuning

```bash
# Increase file descriptor limit
ulimit -n 65536

# Optimize Node.js
NODE_OPTIONS="--max-old-space-size=4096"

# Enable clustering (PM2)
pm2 start src/index.js -i max --name sportscaster
```

---

## Monitoring

### Health Check

```bash
curl http://localhost:3001/api/health
# {"status":"ok","uptime":12345.678}
```

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs sportscaster --lines 100
```

### System Monitoring

```bash
# Check port usage
netstat -tlnp | grep 3001

# Check disk space
df -h

# Check memory
free -m
```

---

## Troubleshooting Deployment

### Server Won't Start

```bash
# Check port availability
lsof -i :3001

# Check Node.js version
node --version

# Check for syntax errors
node --check src/index.js
```

### WebSocket Connection Fails

1. Verify reverse proxy supports WebSocket
2. Check firewall allows WebSocket connections
3. Ensure `CORS_ORIGINS` includes your domain

### Data Not Persisting

1. Check file permissions on `server/data/`
2. Verify disk space
3. Check server logs for write errors

### SSL Certificate Issues

```bash
# Test certificate
openssl s_client -connect yourdomain.com:443

# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```
