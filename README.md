
# 🚀 MechVerse Inventory Tool Deployment Guide

Follow these steps to put your inventory management tool online.

## Option 1: Vercel (Recommended)
1. **Create a GitHub Repository**: Upload all these files to a new repository on [GitHub](https://github.com).
2. **Sign up for Vercel**: Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. **Import Project**: Click "Add New" > "Project" and select your MechVerse repository.
4. **Environment Variables (CRITICAL)**:
   - Before clicking "Deploy", open the **Environment Variables** section.
   - **Key**: `API_KEY`
   - **Value**: Paste your Google Gemini API Key.
5. **Deploy**: Click "Deploy". Your website will be live in seconds!

## Option 2: Netlify
1. **Upload to GitHub**: Same as Option 1.
2. **Sign up for Netlify**: Go to [netlify.com](https://netlify.com).
3. **Add New Site**: Select "Import from git" and choose your repo.
4. **Site Settings**:
   - Go to "Site configuration" > "Environment variables".
   - Add `API_KEY` with your Gemini key.
5. **Deploy**: Trigger a manual deploy.

## Security Note
This application stores inventory data in the browser's `localStorage` or a local file you select. For a multi-user environment where data is shared across different computers, you would need to connect a central database (like Supabase or Firebase).

## Support
If you encounter a "404 Not Found" error when refreshing the page on certain routes, add a file named `vercel.json` or `_redirects` to handle Single Page Application (SPA) routing.
