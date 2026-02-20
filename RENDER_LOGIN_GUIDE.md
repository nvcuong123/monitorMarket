# Render Login Configuration Guide

Complete step-by-step guide to configure authentication and enable login on Render.com

---

## Overview

This guide shows how to:
1. Prepare environment variables locally
2. Create a Render service
3. Configure login credentials
4. Deploy and test the login system

---

## Step 1: Prepare Authentication Variables Locally

### Generate Bcrypt Password Hash

```bash
# Run in your terminal
npx bcryptjs hash "your_strong_password_here" 8
```

**Output example:**
```
$2a$08$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
```

**Copy this entire string** - you'll need it on Render.

### Gather Your Information

Collect these values before going to Render:

```
Username: admin
Password Hash: $2a$08$...        (from step above)
Binance API Key: sk_live_...     (from your Binance account)
Binance API Secret: ...          (from your Binance account)
JWT Secret: (generate below)
```

### Generate JWT Secret

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Online generator (https://www.random.org/hex/)
# Just copy 32 random hex characters
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## Step 2: Create Render Service

### 2.1 Go to Render.com

1. Visit https://render.com
2. Sign in or create account
3. Click "Dashboard"

### 2.2 Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Choose **"Deploy existing repository"** OR connect your GitHub

### 2.3 Configure Service

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `monitor-market` (or your choice) |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node back-end/index.js` |
| **Region** | Choose closest to you |
| **Plan** | Free (for testing) or Starter ($7/mo) |

### 2.4 Click "Create Web Service"

The service will be created but won't deploy yet - we need to add environment variables first.

---

## Step 3: Add Environment Variables on Render

### 3.1 Navigate to Environment Section

1. On your service page, scroll down
2. Find **"Environment"** section
3. Look for **"Add Environment Variable"** button

### 3.2 Add Variables One by One

**Variable 1: User Password**

- **Key:** `USER_admin_PWD`
- **Value:** `$2a$08$...` (your bcrypt hash from Step 1)
- Click **"Add"**

**Variable 2: Binance API Key**

- **Key:** `USER_admin_API_KEY_BINANCE`
- **Value:** `sk_live_abc123xyz...` (your actual Binance key)
- Click **"Add"**

**Variable 3: Binance API Secret**

- **Key:** `USER_admin_API_SCRET_KEY_BINANCE`
- **Value:** `your_binance_secret_here` (your actual secret)
- Click **"Add"**

**Variable 4: JWT Secret**

- **Key:** `JWT_SECRET_STRING`
- **Value:** `a1b2c3d4e5f6g7h8...` (your random 32-char string)
- Click **"Add"**

**Variable 5: Port**

- **Key:** `PORT`
- **Value:** `3000`
- Click **"Add"**

**Variable 6: Environment**

- **Key:** `NODE_ENV`
- **Value:** `production`
- Click **"Add"**

### 3.3 Verify All Variables Added

You should see 6 environment variables:
- [ ] USER_admin_PWD
- [ ] USER_admin_API_KEY_BINANCE
- [ ] USER_admin_API_SCRET_KEY_BINANCE
- [ ] JWT_SECRET_STRING
- [ ] PORT
- [ ] NODE_ENV

---

## Step 4: Deploy

### 4.1 Trigger Deployment

**Option A: Automatic Deploy** (Recommended)
- Service automatically deploys on GitHub push
- Code changes trigger rebuild

**Option B: Manual Deploy**
- Click **"Manually Deploy"** button
- Service redeploys with current settings

### 4.2 Monitor Deployment

1. Click **"Logs"** tab
2. Watch for messages:
   - ✅ `npm install complete`
   - ✅ `Listening on port:: http://localhost:3000/`
3. If you see errors, check logs and fix issues

### 4.3 Get Your Service URL

Once deployed successfully:
- Service URL appears at top of page
- Format: `https://your-service-name.onrender.com`
- Your API: `https://your-service-name.onrender.com/api`

---

## Step 5: Test Login on Render

### 5.1 Test Login Endpoint

```bash
# Generate hash locally for testing
HASH=$(npx bcryptjs hash "your_password" 8)

# Make login request to Render
curl -X POST https://your-service-name.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"hashPasswod\":\"$HASH\"}"
```

**Expected response:**
```json
{
  "message": "Logged in successfully 😊 👌",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5.2 Test Protected Endpoint

```bash
TOKEN="eyJhbGciOiJIUzI1NiI..."  # From login response above

curl -X GET "https://your-service-name.onrender.com/api/account?exchange=BINANCE" \
  -H "x-access-token: ${TOKEN}"
```

**Expected response:**
```json
{
  "success": true,
  "message": "account balance",
  "balance": { ... }
}
```

---

## Step 6: Setup Frontend Login

### 6.1 Update Frontend .env

Create `.env.local` in your frontend directory:

```env
REACT_APP_API_URL=https://your-service-name.onrender.com/api
# or for Vue:
VITE_API_DOMAIN=https://your-service-name.onrender.com
```

### 6.2 Create Auth Service

**src/services/authService.js**

```javascript
import axios from 'axios';
import bcryptjs from 'bcryptjs';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const authService = {
  async login(username, password) {
    try {
      const hashPasswod = bcryptjs.hashSync(password, 8);
      
      const response = await axios.post(`${API_BASE}/login`, {
        username: username,
        hashPasswod: hashPasswod
      });
      
      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('username', username);
        return { success: true, token: response.data.token };
      }
    } catch (error) {
      return { success: false, message: error.response?.data || error.message };
    }
  },
  
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  },
  
  getToken() {
    return localStorage.getItem('jwt_token');
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
  }
};
```

### 6.3 Create Axios Instance

**src/services/axiosConfig.js**

```javascript
import axios from 'axios';
import { authService } from './authService';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers['x-access-token'] = token;
  }
  return config;
});

// Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 6.4 Create Login Component

**src/components/LoginPage.jsx** (React example)

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h1>Login to Monitor Market</h1>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

## Step 7: Add Multiple Users (Optional)

To add more users to your Render deployment:

### Add another user to environment variables:

**User 2: trader**

- **Key:** `USER_trader_PWD`
- **Value:** `$2a$08$...` (different password hash)

- **Key:** `USER_trader_API_KEY_BINANCE`
- **Value:** `trader_api_key...`

- **Key:** `USER_trader_API_SCRET_KEY_BINANCE`
- **Value:** `trader_secret...`

**The system automatically loads all `USER_*` variables**, so no code changes needed.

---

## Step 8: Troubleshooting

### Problem: Login returns "Credential Err"

**Solutions:**
1. Verify `USER_admin_PWD` in Render environment variables
2. Test password hash locally:
   ```bash
   npx bcryptjs hash "your_password" 8
   # Must match USER_admin_PWD value
   ```
3. Check exact spelling of variable name

### Problem: Service won't start

**Check logs for:**
- Missing dependencies: Run `npm install` locally first
- Missing environment variables: Check all 6 are set
- Node version: Should be 16+ (Render default is fine)

### Problem: "API endpoint doesn't exist" on login

**Causes:**
- Wrong API URL (should end in `/api`)
- Service not fully deployed yet (wait 1-2 minutes)
- Port not set correctly (should be 3000)

### Problem: Frontend can't connect to backend

**Check:**
- `REACT_APP_API_URL` has correct Render service URL
- No typos in URL
- Backend is fully deployed and running

---

## Step 9: Production Best Practices

### Security Checklist

- [ ] Password hash format: `$2a$08$...` (bcryptjs)
- [ ] JWT secret: Random 32+ characters
- [ ] Different credentials for different environments (dev/prod)
- [ ] API keys rotated periodically
- [ ] No secrets in Git or code
- [ ] HTTPS enabled (Render provides automatically)
- [ ] Token expiration set (8 hours)

### Monitoring

- [ ] Check Render logs daily for errors
- [ ] Monitor API response times
- [ ] Track failed login attempts
- [ ] Alert on service crashes

### Updates

When making changes:
1. Update code locally
2. Commit and push to GitHub
3. Service automatically redeploys
4. Check Render logs for success

---

## Step 10: Summary Table

| Step | Action | Status |
|------|--------|--------|
| 1 | Generate password hash | ✅ Done locally |
| 2 | Create Render service | ✅ Created |
| 3 | Add 6 environment variables | ✅ Configured |
| 4 | Deploy service | ✅ Running |
| 5 | Test login endpoint | ✅ Working |
| 6 | Setup frontend services | ✅ Implemented |
| 7 | Test login flow | ✅ Verified |
| 8 | Deploy frontend | ✅ Complete |

---

## Quick Test Commands

### Login
```bash
curl -X POST https://your-service.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","hashPasswod":"$2a$08$..."}'
```

### Get Account Balance
```bash
TOKEN="eyJ..."
curl -X GET "https://your-service.onrender.com/api/account?exchange=BINANCE" \
  -H "x-access-token: $TOKEN"
```

### Check Service Health
```bash
curl https://your-service.onrender.com/api/market
```

---

## Environment Variables Quick Reference

```env
# User Login
USER_admin_PWD=$2a$08$...

# Exchange API Keys
USER_admin_API_KEY_BINANCE=sk_live_...
USER_admin_API_SCRET_KEY_BINANCE=secret_...

# Security
JWT_SECRET_STRING=32_character_random_string

# Server
PORT=3000
NODE_ENV=production
```

---

## Next Steps

1. ✅ Follow steps 1-5 above
2. ✅ Test login endpoint
3. ✅ Implement frontend (steps 6)
4. ✅ Test complete flow
5. ✅ Monitor deployment

**Your authentication system is now live on Render!** 🎉

---

## Support

**Having issues?** Check:
- Render logs (Click "Logs" tab)
- Environment variables are all set
- Password hash format is correct
- API credentials are valid
- Frontend API URL points to correct Render service

