#!/bin/bash

# Sacred Scripture Search App - Vercel Deployment Script
# Run this script to deploy your app to Vercel

echo "🚀 Starting deployment to Vercel..."
echo ""

# Step 1: Install Vercel CLI globally
echo "Step 1: Installing Vercel CLI..."
npm install -g vercel

# Step 2: Login to Vercel
echo ""
echo "Step 2: Logging into Vercel..."
echo "A browser window will open. Sign in with your GitHub account."
vercel login

# Step 3: Deploy
echo ""
echo "Step 3: Deploying your app..."
echo "Follow the prompts:"
echo "  - Which scope? (select your account)"
echo "  - Link to existing project? (No)"
echo "  - Project name? (Press Enter for default)"
echo "  - Production settings? (Confirm defaults)"
echo ""
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "⚠️  NEXT: Add your GEMINI_API_KEY environment variable:"
echo "  1. Go to https://vercel.com/dashboard"
echo "  2. Click on your newly deployed project"
echo "  3. Go to Settings → Environment Variables"
echo "  4. Add:"
echo "     - Name: GEMINI_API_KEY"
echo "     - Value: (paste your Gemini API key from https://ai.google.dev)"
echo "  5. Select: Production, Preview, Development"
echo "  6. Click Save"
echo "  7. Redeploy: Run 'vercel --prod'"
echo ""
echo "🎉 Your app will be live at the URL provided by Vercel!"
