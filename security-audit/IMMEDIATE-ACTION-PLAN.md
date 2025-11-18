# 🚀 IMMEDIATE ACTION PLAN - CRITICAL SECURITY FIXES

## ⚡ PRIORITY 0: Fix Within 24 Hours (CRITICAL)

### 1. Update Next.js Framework (VULN-001)
**Risk:** Critical SSRF, Authorization Bypass, Cache Poisoning  
**Current:** 13.5.1 → **Target:** 14.2.32+

```bash
cd project
npm install next@14.2.32
npm install react@latest react-dom@latest
npm test
npm run build
git add package.json package-lock.json
git commit -m "security: update Next.js to fix critical CVEs (GHSA-f82v-jwr5-mffw, GHSA-fr5h-rqp8-mj6g)"
git push
```

**Verification:**
```bash
npm list next
# Should show: next@14.2.32 or higher
```

---

### 2. Replace Hardcoded Encryption Key (VULN-002)
**Risk:** All OAuth tokens can be decrypted by anyone with code access

**Step 1: Generate secure key**
```powershell
# PowerShell
$key = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
Write-Host "ENCRYPTION_KEY=$key"
```

**Step 2: Update `.env` files**
```bash
# Add to .env.local (local development)
ENCRYPTION_KEY=<paste_generated_key_here>

# Add to Vercel environment variables (production)
# Dashboard → Settings → Environment Variables → Add
```

**Step 3: Update `lib/security.ts`**
```typescript
// BEFORE (VULNERABLE):
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!';

// AFTER (SECURE):
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error(
    'ENCRYPTION_KEY must be set in environment variables (min 32 characters). ' +
    'Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
  );
}
```

**Step 4: Rotate all encrypted tokens (FORCE RE-AUTH)**
```sql
-- Run in Supabase SQL Editor
UPDATE mail_accounts 
SET access_token = NULL, refresh_token = NULL, is_active = FALSE
WHERE access_token IS NOT NULL;

-- Notify all users to reconnect their email accounts
```

**Commit:**
```bash
git add lib/security.ts
git commit -m "security(CRITICAL): remove hardcoded encryption key fallback"
git push
```

---

### 3. Install and Implement DOMPurify (VULN-003)
**Risk:** XSS attacks via email bodies and AI responses

**Step 1: Install DOMPurify**
```bash
npm install isomorphic-dompurify
npm install --save-dev @types/dompurify
```

**Step 2: Copy patched sanitization utility**
```bash
# Copy from security-audit/patched/lib/sanitize-html.ts
cp ../security-audit/patched/lib/sanitize-html.ts lib/sanitize-html.ts
```

**Step 3: Update components**

**File: `components/email-detail-window.tsx`**
```typescript
// Add import at top
import { sanitizeEmailHTML } from '@/lib/sanitize-html';

// BEFORE (VULNERABLE):
<div dangerouslySetInnerHTML={{ __html: email.body_html || '' }} />

// AFTER (SECURE):
<div dangerouslySetInnerHTML={{ __html: sanitizeEmailHTML(email.body_html || '') }} />
```

**File: `components/pending-replies-panel.tsx`**
```typescript
import { sanitizeAIHTML } from '@/lib/sanitize-html';

// BEFORE:
<div dangerouslySetInnerHTML={{ __html: selectedReply.generated_body_html || '' }} />

// AFTER:
<div dangerouslySetInnerHTML={{ __html: sanitizeAIHTML(selectedReply.generated_body_html || '') }} />
```

**File: `extension/popup.js`** (Chrome Extension)
```javascript
// Add DOMPurify CDN to popup.html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>

// In popup.js, replace:
resultText.innerHTML = data.html;

// With:
resultText.innerHTML = DOMPurify.sanitize(data.html, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
  ALLOWED_ATTR: ['href']
});
```

**Commit:**
```bash
git add lib/sanitize-html.ts components/ extension/
git commit -m "security(CRITICAL): implement DOMPurify to prevent XSS attacks"
git push
```

---

### 4. Fix IDOR Vulnerability (VULN-004)
**Risk:** Users can modify/delete other users' filters

**Step 1: Copy patched route**
```bash
cp ../security-audit/patched/app/api/filters/[id]/route.ts app/api/filters/[id]/route.ts
```

**Step 2: Create security audit log table**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_id TEXT,
  resource_owner UUID,
  ip_address TEXT,
  success BOOLEAN NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_audit_user ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_action ON public.security_audit_log(action);
CREATE INDEX idx_security_audit_created ON public.security_audit_log(created_at DESC);
```

**Commit:**
```bash
git add app/api/filters/[id]/route.ts
git commit -m "security(CRITICAL): fix IDOR vulnerability in filters API - add ownership checks"
git push
```

---

### 5. Implement CSRF Protection (VULN-005)
**Risk:** Attackers can perform actions on behalf of authenticated users

**Step 1: Copy CSRF module**
```bash
cp ../security-audit/patched/lib/csrf.ts lib/csrf.ts
```

**Step 2: Update middleware**
```bash
cp ../security-audit/patched/middleware.ts middleware.ts
```

**Step 3: Update API routes to use CSRF protection**

**Example: `app/api/filters/route.ts`**
```typescript
import { withCSRFProtection } from '@/lib/csrf';

// Wrap POST handler
export const POST = withCSRFProtection(async (req: NextRequest) => {
  // Your existing handler code
});
```

**Step 4: Update frontend API calls**

**Create: `lib/api-client.ts`**
```typescript
import { getCSRFTokenFromCookie } from '@/lib/csrf';

export async function apiPost(url: string, data: any) {
  const csrfToken = getCSRFTokenFromCookie();
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || ''
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function apiPatch(url: string, data: any) {
  const csrfToken = getCSRFTokenFromCookie();
  
  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || ''
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function apiDelete(url: string) {
  const csrfToken = getCSRFTokenFromCookie();
  
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Token': csrfToken || ''
    },
    credentials: 'include'
  });
}
```

**Commit:**
```bash
git add lib/csrf.ts middleware.ts lib/api-client.ts
git commit -m "security(CRITICAL): implement CSRF protection for all state-changing operations"
git push
```

---

### 6. Strengthen Content Security Policy (VULN-010)
**Already included in updated middleware.ts**

Verify CSP doesn't allow unsafe directives:
```bash
grep "'unsafe-eval'" middleware.ts
grep "'unsafe-inline'.*script" middleware.ts
# Should return NO results
```

---

## ⚡ PRIORITY 1: Fix Within 7 Days (HIGH)

### 7. Update All Vulnerable Dependencies
```bash
npm audit fix --force
npm audit
```

### 8. Add Rate Limiting on Auth Endpoints
**Already included in updated middleware.ts**

Verify:
```typescript
// middleware.ts should have authRateLimitMap
// 5 attempts per 15 minutes on /api/auth/*
```

### 9. Configure Session Timeout
**File: `lib/auth.ts`**
```typescript
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
    updateAge: 10 * 60, // Refresh every 10 minutes
  },
  // ... rest of config
};
```

### 10. Rotate All API Keys and Secrets
```bash
# Generate new NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Update in Vercel:
# - NEXTAUTH_SECRET
# - OPENAI_API_KEY (rotate in OpenAI dashboard)
# - STRIPE_SECRET_KEY (rotate in Stripe dashboard)
# - GOOGLE_CLIENT_SECRET (rotate in Google Cloud Console)
# - MICROSOFT_CLIENT_SECRET (rotate in Azure Portal)
```

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] ✅ Next.js updated to 14.2.32+
- [ ] ✅ Hardcoded encryption key removed
- [ ] ✅ ENCRYPTION_KEY set in production env vars
- [ ] ✅ All OAuth tokens rotated (users forced to re-auth)
- [ ] ✅ DOMPurify installed and implemented
- [ ] ✅ IDOR vulnerability fixed in filters API
- [ ] ✅ CSRF protection implemented
- [ ] ✅ Security audit log table created
- [ ] ✅ Middleware updated with enhanced security
- [ ] ✅ CSP strengthened (no unsafe-eval/unsafe-inline)
- [ ] ✅ Rate limiting active on auth endpoints
- [ ] ✅ Session timeout configured (30 minutes)
- [ ] ✅ All API keys rotated
- [ ] ✅ npm audit shows 0 critical/high vulnerabilities
- [ ] ✅ Security headers validated
- [ ] ✅ HTTPS enforced in production
- [ ] ✅ Monitoring configured (Sentry/DataDog)

---

## 🧪 TESTING

**Manual Tests:**
```bash
# 1. Test XSS protection
# Try submitting: <img src=x onerror=alert(1)>
# Expected: Sanitized output, no alert

# 2. Test IDOR protection
# User A creates filter → User B tries to modify via API
# Expected: 403 Forbidden

# 3. Test CSRF protection
# Try POST without X-CSRF-Token header
# Expected: 403 Forbidden

# 4. Test rate limiting
# Make 6 auth attempts from same IP
# Expected: 429 Too Many Requests
```

**Automated Tests:**
```bash
npm run test:security
npm run build
npm run lint
```

---

## 📊 VERIFICATION

**After deployment, run:**
```bash
# Check security headers
curl -I https://your-domain.com | grep -i "security\|csp\|hsts"

# Verify Next.js version
npm list next

# Run security scan
npm audit

# Check for secrets
git log --all --full-history -- "*" | grep -i "api_key\|secret"
```

**External Tools:**
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## 🚨 IF SOMETHING BREAKS

**Rollback plan:**
1. Revert to previous commit: `git revert HEAD`
2. Redeploy previous version
3. Review error logs
4. Apply patches incrementally

**Support:**
- Review: `security-audit/report/complete-security-report.md`
- Check: `security-audit/patched/` for corrected files
- Test: `security-audit/tests/` for security tests

---

**Estimated Time:**
- P0 Fixes: 4-6 hours
- P1 Fixes: 8-12 hours
- Testing: 2-4 hours
- **Total: 14-22 hours**

**Success Criteria:**
- Security score: 52/100 → 90+/100
- Critical vulnerabilities: 12 → 0
- High vulnerabilities: 18 → < 3
