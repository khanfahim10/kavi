# ⚡ Quick Deploy Reference

## 🎯 You're Here → Get Your App Online

### Option 1: Use GitHub Desktop (5 minutes)

1. **Install GitHub Desktop**: https://desktop.github.com
2. **Add Repository**:
   - File → Add Local Repository
   - Select: `/Users/gracekarunaas/Desktop/SYNC`
   - Publish Repository → Name: `its-for-you-kavitha`
3. **Deploy on Railway**:
   - Go to: https://railway.app
   - Sign up with GitHub
   - New Project → Deploy from GitHub
   - Select: `its-for-you-kavitha`
   - Wait 2-3 minutes
4. **Get Your URL**:
   - Settings → Domains → Generate Domain
   - Copy your URL: `https://xxxxx.up.railway.app`

### Option 2: Command Line (3 minutes)

```bash
# 1. Create repo on GitHub: https://github.com/new
#    Name: its-for-you-kavitha

# 2. Push code
cd /Users/gracekarunaas/Desktop/SYNC
git remote add origin https://github.com/YOUR_USERNAME/its-for-you-kavitha.git
git push -u origin main

# 3. Deploy on Railway
# Go to https://railway.app
# New Project → Deploy from GitHub → Select repo
```

---

## 🔄 After First Deploy

Update these URLs in `public/app.js` with your Railway URL:

**Line 15:**
```javascript
socket = io('https://YOUR-APP.up.railway.app');
```

**Line 156:**
```javascript
fetch('https://YOUR-APP.up.railway.app/api/rooms', {
```

Then:
```bash
git add .
git commit -m "Update production URLs"
git push
```

---

## ✅ That's It!

Your app will be live at: `https://YOUR-APP.up.railway.app`

**Full guide:** See `DEPLOY_TO_RAILWAY.md` for detailed steps.

---

## 💡 Quick Links

- **Railway**: https://railway.app
- **GitHub**: https://github.com
- **GitHub Desktop**: https://desktop.github.com
