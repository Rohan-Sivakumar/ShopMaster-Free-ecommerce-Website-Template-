# Vite Permission Denied Error - SOLUTION GUIDE 🔧

**Error Message:** `sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied`

**Environment:** Vercel or similar server deployment
**Date:** December 20, 2025
**Severity:** 🔴 CRITICAL - Blocks deployment

---

## 📌 WHAT'S HAPPENING

When you deployed to Vercel, the Vite binary file lost execute permissions.

**Why?**
- `.bin/vite` needs execute permission (755)
- During deployment, it got 644 (read-only)
- When npm tries to run it, permission denied!

---

## 🛠️ SOLUTION #1: Fix in Build Script (RECOMMENDED) ✅

### Step 1: Update package.json

Add permission fix to your build script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "chmod +x node_modules/.bin/* && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx"
  }
}
```

**What this does:**
- `chmod +x node_modules/.bin/*` - Makes all binaries executable
- `vite build` - Runs the build

---

## 🛠️ SOLUTION #2: Fix via Vercel Deployment Settings

### Option A: vercel.json Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Option B: Add .vercelignore

Create `.vercelignore`:

```
node_modules
.git
.env
.env.local
```

---

## 🛠️ SOLUTION #3: Clean Reinstall

### Local Machine:

```bash
# Delete node_modules and lock
rm -rf node_modules
rm package-lock.json

# Fresh install
npm install

# Test locally
npm run dev
npm run build
```

### Then Push to Vercel:

```bash
git add .
git commit -m "fix: Clean dependencies and fix Vite permissions"
git push
```

---

## 🛠️ SOLUTION #4: Use npx Instead

Update scripts in package.json:

```json
{
  "scripts": {
    "dev": "npx vite",
    "build": "npx vite build",
    "preview": "npx vite preview"
  }
}
```

**Advantage:** `npx` handles permissions automatically

---

## 🔧 COMPLETE FIX FOR package.json

Replace your `scripts` section with this:

```json
{
  "name": "shopmaster",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "chmod +x node_modules/.bin/vite && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx",
    "fix-permissions": "chmod +x node_modules/.bin/*"
  },
  "dependencies": {
    "@fortawesome/fontawesome-svg-core": "^7.1.0",
    "@fortawesome/free-solid-svg-icons": "^7.1.0",
    "@fortawesome/react-fontawesome": "^3.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "sweetalert2": "^11.26.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "vite": "^7.2.4"
  }
}
```

---

## ✅ VERIFICATION STEPS

### Local (Before Pushing):

```bash
# 1. Run fix-permissions script
npm run fix-permissions

# 2. Verify permissions
ls -la node_modules/.bin/vite
# Should show: -rwxr-xr-x (755 or similar with 'x')

# 3. Test build locally
npm run build
# Should complete successfully

# 4. Test dev server
npm run dev
# Should start at http://localhost:5173
```

### On Vercel:

1. Push to GitHub
2. Vercel auto-deploys
3. Build should now succeed
4. Check deployment logs for success

---

## 🚨 IF IT STILL FAILS

### Check 1: Verify .gitignore

Make sure `node_modules` is in `.gitignore`:

```bash
cat .gitignore | grep node_modules
# Should show: node_modules
```

### Check 2: Clear Vercel Cache

1. Go to Vercel dashboard
2. Project Settings → Git
3. Deployments → Clear Build Cache
4. Redeploy

### Check 3: Manual Vercel Fix

In Vercel project settings:

```
Build Command: npm run build
Start Command: npm run preview
Output Directory: dist
```

---

## 📋 ROOT CAUSE ANALYSIS

**Why did this happen?**

1. You had old `node_modules` locally
2. Updated `package.json` with new dependencies
3. Committed to Git
4. Vercel pulled old `node_modules` from cache
5. Vite binary lost executable permission

**Prevention:**
- Always run `npm install` locally after package.json changes
- Delete `node_modules` before committing major dependency changes
- Use `.gitignore` to exclude `node_modules`

---

## 📦 COMPLETE DEPLOYMENT CHECKLIST

- [ ] Run `npm install` locally
- [ ] Run `npm run build` - should succeed
- [ ] Run `npm run dev` - should start
- [ ] Commit changes to Git
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Check build logs for success
- [ ] Visit deployed URL
- [ ] App loads and works

---

## 🎯 QUICK FIX (COPY-PASTE)

### Step 1: Update build script

```bash
# Edit package.json and change build to:
"build": "chmod +x node_modules/.bin/vite && vite build"
```

### Step 2: Test locally

```bash
npm run build
```

### Step 3: Push to Git

```bash
git add package.json
git commit -m "fix: Add permission fix for Vite binary"
git push
```

### Step 4: Vercel redeploys automatically ✅

---

## 💡 ALTERNATIVE: Use Postinstall Script

Add to package.json:

```json
{
  "scripts": {
    "postinstall": "chmod +x node_modules/.bin/*"
  }
}
```

This runs automatically after `npm install`!

---

**Status:** All solutions provided ✅
**Recommendation:** Use Solution #1 (chmod in build script)
**Time to fix:** < 2 minutes
