# Deploy super-chess on AWS EC2

super-chess is a fully client-side React app (no backend). Deploy it as static files served by Nginx on a single EC2 instance.

---

## 1. Build

```bash
cd /home/joeyvigil/Projects/super-chess
npm install
npm run build
```

The output goes to `dist/`.

---

## 2. Launch an EC2 instance

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

## 3. Upload the built files

```bash
scp -i /path/to/your-key.pem -r dist/* ubuntu@<PUBLIC_IP>:/home/ubuntu/super-chess/
```

---

## 4. Configure the instance

SSH in:

```bash
ssh -i /path/to/your-key.pem ubuntu@<PUBLIC_IP>
```

```bash
# Install Nginx
sudo apt update && sudo apt install -y nginx

# Move files to web root
sudo mkdir -p /var/www/super-chess
sudo mv /home/ubuntu/super-chess/* /var/www/super-chess/

# Set ownership
sudo chown -R www-data:www-data /var/www/super-chess
```

---

## 5. Nginx config

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

## 6. Verify

Visit `http://<PUBLIC_IP>` in a browser. You should see super-chess.

---

## 7. (Optional) Domain + SSL with Let's Encrypt

```bash
# Point your domain's A record to <PUBLIC_IP>, then:

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 8. Updates

Re-build, re-upload (`scp` as in step 3), then on the server:

```bash
sudo cp -r /home/ubuntu/super-chess/* /var/www/super-chess/
```
