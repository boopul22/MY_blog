# Deployment Guide

## Vercel Deployment

### Environment Variables Setup

To deploy this application on Vercel and avoid the console errors you encountered, you need to set up the following environment variables in your Vercel dashboard:

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings > Environment Variables**
3. **Add the following variables:**

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your Vercel environment variables

### Important Notes

- ✅ **Tailwind CSS**: Now properly configured for production (no more CDN warnings)
- ✅ **Gemini API**: Fixed to handle missing API keys gracefully
- ⚠️ **API Key**: Required for AI features to work (blog generation, SEO metadata)

### After Setting Environment Variables

1. Redeploy your application on Vercel
2. The console errors should be resolved
3. AI features will work if you've added the Gemini API key

### Local Development

For local development, create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit the `.env` file and add your actual API keys.