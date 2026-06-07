# 🚀 Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Click "Import Project"**
3. **Paste your repo URL**: `https://github.com/kokim15/-`
4. **Connect your GitHub account** (if not already done)
5. **Vercel will auto-detect settings**
6. **Add Environment Variables**:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key from https://ai.google.dev
7. **Click Deploy** ✅

---

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your repo directory
vercel
```

When prompted:
- **Which scope?** - Select your account
- **Link to existing project?** - No
- **Project name?** - Keep default or enter custom name
- **Production settings?** - Confirm defaults

Then add `GEMINI_API_KEY` environment variable in Vercel dashboard.

---

## Environment Variables Setup

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your deployed project
3. **Settings** → **Environment Variables**
4. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
   - **Select Environment**: Production, Preview, Development (check all)
5. **Save** and redeploy

---

## Verify Deployment

After deployment completes:

1. ✅ Visit your app URL (provided by Vercel)
2. ✅ Test the search feature
3. ✅ Check browser console for errors
4. ✅ Verify API calls work

---

## Troubleshooting

### "GEMINI_API_KEY is not defined"
- Add the environment variable in Vercel dashboard
- Redeploy after adding it

### Build fails
```bash
# Test locally first
npm install
npm run build
```

### API errors
- Verify your Gemini API key is valid
- Check usage limits at https://ai.google.dev/account

---

## Your App Features

🔍 **Search** across 4 major religions
📖 **AI-Powered** results using Google Gemini
🌍 **Multi-language** support (Bengali + English)
✨ **Beautiful UI** with Tailwind CSS
⚡ **Fast** with Vite + React 19

Enjoy! 🎉
