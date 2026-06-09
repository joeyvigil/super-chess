# Deploy super-chess on AWS EC2

super-chess is a fully client-side React app (no backend). Deploy it as static files served by Nginx on a single EC2 instance.

---

## 1. Launch an EC2 instance

1. Open the [EC2 console](https://console.aws.amazon.com/ec2/) → **Launch instance**.
2. **Name**: `super-chess`
3. **AMI**: Ubuntu 24.04 LTS (free tier eligible)
4. **Instance type**: `t2.micro` or `t3.micro`
5. **Key pair**: Create or select an existing `.pem` key
6. **Network settings**:
   - Allow SSH (22) from your IP
   - Allow HTTP (80) from `0.0.0.0/0`
   - Allow HTTPS (443) from `0.0.0.0/0` (if using SSL)
7. **Storage**: 8 GiB gp3 (free tier)
8. Click **Launch instance**.

---

## 2. SSH in and clone the repo

```bash
ssh -i /path/to/your-key.pem ubuntu@<PUBLIC_IP>
```

```bash
# Install Node.js (LTS)
sudo apt update && sudo apt install -y nginx nodejs npm

# Clone the project
git clone https://github.com/joeyvigil/super-chess.git
cd super-chess

# Install dependencies and build
npm install
npm run build
```

---

## 3. Move the built files to the web root

```bash
sudo mkdir -p /var/www/super-chess
sudo cp -r dist/* /var/www/super-chess/
sudo chown -R www-data:www-data /var/www/super-chess
```

---

## 4. Nginx config

```bash
sudo nano /etc/nginx/sites-available/super-chess
```

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/super-chess;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/super-chess /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. Verify

Visit `http://<PUBLIC_IP>` in a browser. You should see super-chess.

---

## 6. (Optional) Domain + SSL with Let's Encrypt

```bash
# Point your domain's A record to <PUBLIC_IP>, then:

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 7. Updates

```bash
ssh -i /path/to/your-key.pem ubuntu@<PUBLIC_IP>
cd ~/super-chess
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/super-chess/
```
