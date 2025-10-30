# Production Deployment Checklist

Complete pre-flight checklist for deploying Ink Wave Digital to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

#### **Clerk Setup**
- [ ] Production Clerk application created
- [ ] `CLERK_SECRET_KEY` obtained (starts with `sk_live_`)
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` obtained (starts with `pk_live_`)
- [ ] `CLERK_WEBHOOK_SECRET` generated
- [ ] Production domains added to Clerk **Allowed Origins**:
  - [ ] `https://dashboard.yourdomain.com`
  - [ ] `https://api.yourdomain.com`
- [ ] Redirect URLs updated in Clerk:
  - [ ] Sign-in URL: `https://dashboard.yourdomain.com/sign-in`
  - [ ] Sign-up URL: `https://dashboard.yourdomain.com/sign-up`
  - [ ] After sign-in: `https://dashboard.yourdomain.com/`
  - [ ] After sign-up: `https://dashboard.yourdomain.com/`

#### **Clerk Webhook Configuration**
- [ ] Webhook endpoint added in Clerk Dashboard
- [ ] Webhook URL: `https://api.yourdomain.com/api/v1/webhooks/clerk`
- [ ] Events subscribed:
  - [ ] `user.created`
  - [ ] `user.updated`
- [ ] Webhook secret copied to `CLERK_WEBHOOK_SECRET` env var
- [ ] Test webhook with Clerk Dashboard webhook tester

#### **Cloudflare R2 Storage**
- [ ] R2 bucket created (e.g., `inkwave-images-prod`)
- [ ] Public access configured for bucket
- [ ] R2 API token generated with **Read & Write** permissions
- [ ] Bucket CORS configured:
```json
[
  {
    "AllowedOrigins": ["https://dashboard.yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
- [ ] `R2_ACCOUNT_ID` obtained
- [ ] `R2_ACCESS_KEY_ID` obtained
- [ ] `R2_SECRET_ACCESS_KEY` obtained
- [ ] `R2_BUCKET_NAME` set to production bucket
- [ ] `R2_PUBLIC_URL` obtained (e.g., `https://pub-xxxxx.r2.dev`)

#### **Database**
- [ ] Production PostgreSQL database provisioned
- [ ] Strong database password generated
- [ ] `DATABASE_URL` obtained from Render
- [ ] Automatic backups enabled
- [ ] Connection pooling configured (if needed)

#### **Security**
- [ ] `JWT_SECRET` generated (32+ random characters)
```bash
openssl rand -base64 32
```
- [ ] `CORS_ORIGINS` set to production domains only:
  - [ ] No `localhost` entries
  - [ ] No wildcard `*`
  - [ ] Format: `https://yourdomain.com,https://dashboard.yourdomain.com`
- [ ] All secrets stored as **environment variables** (not in code)
- [ ] `.env` file added to `.gitignore`

#### **Sentry Monitoring** (Optional but Recommended)
- [ ] Sentry project created (separate for API/Dashboard/Customer)
- [ ] `SENTRY_DSN` obtained for API
- [ ] `VITE_SENTRY_DSN` obtained for Dashboard
- [ ] `VITE_SENTRY_DSN` obtained for Customer
- [ ] `SENTRY_ENVIRONMENT` set to `production`
- [ ] Source maps upload configured (optional)

#### **Slack Notifications** (Optional)
- [ ] Slack workspace configured
- [ ] Webhook URLs created:
  - [ ] `SLACK_WEBHOOK_URL` (general alerts)
  - [ ] `SLACK_OPERATIONS_WEBHOOK_NEW_ORDERS` (new orders)
  - [ ] `SLACK_OPERATIONS_WEBHOOK_ORDER_UPDATES` (order updates)
  - [ ] `SLACK_OPERATIONS_WEBHOOK_HIGH_VALUE` (high-value orders)
- [ ] `SLACK_ALERTS_ENABLED=true`
- [ ] `SLACK_OPERATIONS_ENABLED=true`
- [ ] `HIGH_VALUE_ORDER_THRESHOLD` set (e.g., `1000`)

---

### 2. Code Preparation

#### **Version Control**
- [ ] All changes committed to Git
- [ ] No uncommitted changes
- [ ] `.gitignore` properly configured
- [ ] Sensitive files not tracked
- [ ] Code pushed to GitHub `main` branch

#### **Dependencies**
- [ ] All dependencies installed: `pnpm install`
- [ ] No security vulnerabilities: `pnpm audit`
- [ ] Lock file committed: `pnpm-lock.yaml`
- [ ] Production dependencies only in Dockerfile

#### **Build Testing**
- [ ] API builds successfully: `pnpm run build:api`
- [ ] Customer builds successfully: `pnpm run build:customer`
- [ ] Dashboard builds successfully: `pnpm run build:dashboard`
- [ ] No build errors or warnings (critical ones)

#### **Database Migrations**
- [ ] All migrations created: `pnpm --filter @inkwave/db drizzle:generate`
- [ ] Migrations tested locally
- [ ] Migration files committed to Git
- [ ] Migration script configured: `migrate:prod` in `package.json`

---

### 3. Super Admin Setup

#### **Before Deployment**
- [ ] Super admin emails identified
- [ ] `SUPER_ADMIN_EMAIL_1` environment variable set
- [ ] Additional super admin emails set (if needed):
  - [ ] `SUPER_ADMIN_EMAIL_2`
  - [ ] `SUPER_ADMIN_EMAIL_3`

#### **After Deployment**
- [ ] Super admin users created in Clerk (with identified emails)
- [ ] Clerk User IDs obtained for each super admin
- [ ] Super admin records inserted in database:
```sql
INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)
VALUES 
  ('user_xxxxx', 'admin@yourdomain.com', 'super_admin', 'active', '{}'),
  ('user_yyyyy', 'admin2@yourdomain.com', 'super_admin', 'active', '{}');
```
- [ ] Super admin login tested
- [ ] Super admin dashboard access verified
- [ ] Tenant management features tested

---

### 4. Initial Data Setup

#### **Seed Data** (Optional)
- [ ] Demo tenant created (or production tenant)
- [ ] Demo venue created
- [ ] Test tables created
- [ ] Sample menu items added (for testing)
- [ ] Test orders placed and verified

#### **Production Data**
- [ ] First real tenant created via super admin dashboard
- [ ] Tenant users invited via dashboard
- [ ] Users' Clerk metadata synced (tenantId, role)
- [ ] Venue(s) created
- [ ] Tables configured and QR codes generated
- [ ] Menu categories created
- [ ] Menu items added with images
- [ ] Item options configured (sizes, add-ons, etc.)

---

### 5. Render Deployment

#### **Render Setup**
- [ ] Render account created/logged in
- [ ] GitHub repository connected
- [ ] Blueprint detected from `render.yaml`
- [ ] Services created:
  - [ ] PostgreSQL database
  - [ ] API web service
  - [ ] Customer static site
  - [ ] Dashboard static site

#### **Environment Variables - API**
```bash
# Database (auto-populated by Render)
DATABASE_URL=<from-render>

# Security
JWT_SECRET=<strong-random-secret>
CORS_ORIGINS=https://yourdomain.com,https://dashboard.yourdomain.com

# Clerk
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Super Admin
SUPER_ADMIN_EMAIL_1=admin@yourdomain.com
SUPER_ADMIN_EMAIL_2=admin2@yourdomain.com

# Cloudflare R2
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=inkwave-images-prod
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Sentry (optional)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=production

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx
SLACK_ALERTS_ENABLED=true
SLACK_OPERATIONS_ENABLED=true
SLACK_OPERATIONS_WEBHOOK_NEW_ORDERS=https://hooks.slack.com/services/xxxxx
SLACK_OPERATIONS_WEBHOOK_ORDER_UPDATES=https://hooks.slack.com/services/xxxxx
SLACK_OPERATIONS_WEBHOOK_HIGH_VALUE=https://hooks.slack.com/services/xxxxx
HIGH_VALUE_ORDER_THRESHOLD=1000

# Performance
SLOW_REQUEST_THRESHOLD_MS=1000
```

- [ ] All variables added to Render API service
- [ ] Variables marked as **secret** where applicable

#### **Environment Variables - Customer PWA**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws

# Sentry (optional)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=production
```

- [ ] All variables added to Render Customer service

#### **Environment Variables - Dashboard**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# Sentry (optional)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=production
```

- [ ] All variables added to Render Dashboard service

#### **Deploy Services**
- [ ] Click "Apply" in Render Blueprint
- [ ] Monitor deployment logs
- [ ] Wait for all services to be **Live**
- [ ] Check health endpoint: `https://api.yourdomain.com/health`

---

### 6. Custom Domain Configuration

#### **DNS Setup**
Add these CNAME records in your DNS provider:

```
Type    Name        Value                           TTL
CNAME   api         inkwave-api.onrender.com        3600
CNAME   dashboard   inkwave-dashboard.onrender.com  3600
CNAME   @           inkwave-customer.onrender.com   3600
```

**Note:** Some DNS providers require ALIAS or ANAME for root domain (`@`)

- [ ] DNS records added
- [ ] DNS propagation verified (can take 5-60 minutes)
- [ ] Test with: `dig api.yourdomain.com` or `nslookup`

#### **Render Custom Domain**
For each service in Render:
- [ ] API: Add custom domain `api.yourdomain.com`
- [ ] Dashboard: Add custom domain `dashboard.yourdomain.com`
- [ ] Customer: Add custom domain `yourdomain.com` or `order.yourdomain.com`
- [ ] Wait for SSL certificate provisioning (automatic, ~5 minutes)
- [ ] Verify HTTPS works for all domains

#### **Update Environment Variables**
After custom domains are active and SSL is provisioned:

**API:**
```bash
CORS_ORIGINS=https://yourdomain.com,https://dashboard.yourdomain.com
```

**Customer PWA:**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
```

**Dashboard:**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

- [ ] Environment variables updated in Render
- [ ] Frontend services redeployed (to rebuild with new env vars)
- [ ] API service restarted (to apply new CORS settings)

---

### 7. Post-Deployment Verification

#### **Service Health Checks**
- [ ] API health endpoint responds:
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

- [ ] Customer PWA loads:
```bash
curl -I https://yourdomain.com
# Expected: HTTP/2 200
```

- [ ] Dashboard loads:
```bash
curl -I https://dashboard.yourdomain.com
# Expected: HTTP/2 200
```

#### **Authentication Flow**
- [ ] Visit `https://dashboard.yourdomain.com`
- [ ] Click "Sign In"
- [ ] Clerk modal opens
- [ ] Sign in with test account
- [ ] Dashboard loads successfully
- [ ] User info appears in header
- [ ] Sign out works

#### **Super Admin Flow**
- [ ] Sign in with super admin email
- [ ] "Super Admin Dashboard" appears in header
- [ ] Navigate to `/admin` route
- [ ] Tenant management page loads
- [ ] Can view all tenants
- [ ] Can create new tenant (test it)
- [ ] Super admin features work correctly

#### **Core Features Testing**

**Dashboard:**
- [ ] Venue selector works
- [ ] Can create/edit venues
- [ ] Can create/edit tables
- [ ] QR code generation works
- [ ] Can view/download QR codes
- [ ] Menu management loads
- [ ] Can create categories
- [ ] Can create menu items
- [ ] Image upload works (R2 storage)
- [ ] Can add item options
- [ ] Settings page loads
- [ ] Can update venue settings

**Customer Flow:**
- [ ] Scan QR code or visit table URL
- [ ] Menu loads with items
- [ ] Can browse categories
- [ ] Can view item details
- [ ] Can add items to cart
- [ ] Cart updates correctly
- [ ] Can place order
- [ ] Order confirmation appears

**KDS (Kitchen Display System):**
- [ ] Navigate to KDS page
- [ ] Placed order appears in KDS
- [ ] Can update order status
- [ ] Status changes reflect in real-time (WebSocket)
- [ ] Order completion works
- [ ] Order history visible

**Webhooks:**
- [ ] Clerk webhook receiving events (check API logs)
- [ ] User creation triggers metadata sync
- [ ] User metadata includes tenantId and role
- [ ] Slack notifications work (if enabled)

#### **Performance Checks**
- [ ] Page load times acceptable (<3s)
- [ ] API response times reasonable (<1s for most endpoints)
- [ ] Images load from R2
- [ ] No console errors in browser
- [ ] No critical warnings in API logs
- [ ] WebSocket connections stable

#### **Security Verification**
- [ ] HTTPS enforced on all domains
- [ ] Security headers present:
```bash
curl -I https://yourdomain.com | grep -i "x-frame\|x-content\|strict-transport"
```
- [ ] CORS only allows specified origins
- [ ] API endpoints require authentication (test without auth)
- [ ] Super admin endpoints require super admin role
- [ ] Clerk webhook signature verified

#### **Error Handling**
- [ ] 404 pages load correctly
- [ ] API errors return proper status codes
- [ ] Frontend handles API errors gracefully
- [ ] No sensitive data in error messages
- [ ] Sentry capturing errors (if configured)

---

### 8. Monitoring & Alerts

#### **Render Monitoring**
- [ ] Health checks enabled (automatic for API)
- [ ] Alerts configured in Render:
  - [ ] Failed health checks → Email/Slack
  - [ ] Deployment failures → Email
  - [ ] High memory usage → Email
- [ ] Log retention understood (7 days on Starter plan)

#### **Sentry** (if enabled)
- [ ] Sentry dashboard accessible
- [ ] Errors being captured
- [ ] Source maps uploaded (optional)
- [ ] Alert rules configured
- [ ] Team notifications set up

#### **Uptime Monitoring** (optional but recommended)
Consider using external uptime monitoring:
- [ ] UptimeRobot configured
- [ ] Pingdom configured
- [ ] StatusCake configured
- [ ] Or similar service
- [ ] Monitors checking:
  - [ ] API health endpoint
  - [ ] Customer PWA homepage
  - [ ] Dashboard homepage

---

### 9. Documentation

#### **Internal Documentation**
- [ ] Production URLs documented:
  - API: `https://api.yourdomain.com`
  - Customer: `https://yourdomain.com`
  - Dashboard: `https://dashboard.yourdomain.com`
- [ ] Super admin credentials documented (securely!)
- [ ] Environment variables documented (without values)
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed

#### **User Documentation**
- [ ] Staff training materials prepared
- [ ] How to access dashboard
- [ ] How to manage menu
- [ ] How to use KDS
- [ ] How to generate table QR codes
- [ ] FAQ for common issues

---

### 10. Backup & Disaster Recovery

#### **Database Backups**
- [ ] Automatic backups enabled in Render (included in Starter plan)
- [ ] Backup retention period noted (7 days)
- [ ] Manual backup tested:
```bash
# From Render Shell
pg_dump $DATABASE_URL > backup.sql
```
- [ ] Restore procedure documented
- [ ] Off-site backup strategy (optional):
  - [ ] Weekly manual backups to external storage
  - [ ] S3/R2 backup storage configured

#### **Disaster Recovery Plan**
- [ ] Rollback procedure documented
- [ ] Database restore steps documented
- [ ] Service restart procedures documented
- [ ] Emergency contact list created
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined

---

### 11. Performance Optimization (Post-Launch)

#### **Immediate**
- [ ] Enable CDN (Cloudflare) if not already
- [ ] Configure caching headers
- [ ] Optimize images in R2
- [ ] Review and optimize slow queries

#### **Ongoing**
- [ ] Monitor slow requests (SLOW_REQUEST_THRESHOLD_MS)
- [ ] Review API logs for bottlenecks
- [ ] Database query optimization
- [ ] Consider database indexes for frequent queries
- [ ] Load testing conducted
- [ ] Scaling strategy defined

---

### 12. Cost Optimization

#### **Current Costs**
- Render PostgreSQL Starter: $7/month
- Render API Web Service Starter: $7/month
- Render Static Sites (2): Free
- **Total: ~$14/month**

#### **Cost Monitoring**
- [ ] Render billing dashboard reviewed
- [ ] Usage metrics monitored
- [ ] No unexpected charges
- [ ] Scaling plan in place if costs increase

#### **Free Tier Resources Used**
- [ ] Customer Static Site (Free)
- [ ] Dashboard Static Site (Free)
- [ ] 750 hours/month web service (Free tier not applicable if using Starter)
- [ ] 100 GB bandwidth/month

---

## 🚀 Go-Live Approval

**Deployment Approved By:** _____________________

**Date:** _____________________

**Production URLs:**
- API: `https://api.yourdomain.com`
- Customer: `https://yourdomain.com`
- Dashboard: `https://dashboard.yourdomain.com`

**Database:** `postgresql://...` (on Render)

**Monitoring:** Render Dashboard + Sentry (optional)

**Backup Strategy:** Automatic daily (Render) + Weekly manual

**Emergency Contact:** _____________________

---

## 📞 Support Resources

- **Render Support:** https://render.com/support
- **Render Docs:** https://render.com/docs
- **Clerk Support:** https://clerk.com/support
- **Clerk Docs:** https://clerk.com/docs
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **Project Docs:** `docs/deployment/deployment.md`

---

## ✅ Post-Launch Tasks (After Deployment)

### Week 1
- [ ] Monitor error rates daily
- [ ] Review API logs for issues
- [ ] Check uptime (should be >99%)
- [ ] Collect user feedback
- [ ] Address any critical bugs

### Week 2-4
- [ ] Optimize performance based on metrics
- [ ] Review and adjust alert thresholds
- [ ] Update documentation based on learnings
- [ ] Plan feature rollout
- [ ] Conduct retrospective

### Monthly
- [ ] Review costs and optimize
- [ ] Check backup integrity
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance review

---

**🎉 Deployment Complete!**

Follow this checklist carefully, and your production deployment will be smooth and successful!

---

**Last Updated:** 2025-10-30

**Version:** 1.0.0

