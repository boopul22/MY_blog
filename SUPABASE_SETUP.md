# Supabase Integration Setup Guide

This guide will help you set up Supabase for your blog platform to replace the in-memory data storage with a real database.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Basic understanding of SQL

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "blog-platform")
5. Create a strong database password
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste it into the SQL Editor and run it

This will create:
- `categories` table for blog categories
- `tags` table for blog tags
- `posts` table for blog posts with SEO fields
- `post_tags` junction table for many-to-many relationship
- Row Level Security (RLS) policies
- Sample data for testing

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon public key
3. Update your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Set Up Authentication (Optional)

If you want to use Supabase authentication:

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL (e.g., `http://localhost:5174` for development)
3. Set up email templates if needed
4. Configure any OAuth providers you want to use

## Step 5: Test the Integration

1. Start the development server: `npm run dev`
2. Navigate to your blog
3. Try creating, editing, and deleting posts
4. Check that data persists in your Supabase database

## Features Included

### Database Tables
- **Posts**: Title, content, SEO metadata, status, featured images
- **Categories**: Organized content categorization
- **Tags**: Flexible content tagging system
- **Post Tags**: Many-to-many relationship between posts and tags

### Real-time Updates
- Changes to posts, categories, and tags are reflected in real-time
- Multiple users can collaborate simultaneously

### Security
- Row Level Security (RLS) enabled on all tables
- Public read access for published content
- Authenticated user access for admin operations

### SEO Features
- SEO title and description fields
- Automatic slug generation
- Content vector storage for future semantic search

## Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**
   - Check your Supabase URL and anon key in `.env.local`
   - Ensure your Supabase project is active

2. **Authentication issues**
   - Verify your site URL is configured in Supabase Auth settings
   - Check that RLS policies allow the operations you're trying to perform

3. **Data not appearing**
   - Ensure the database schema was created successfully
   - Check the browser console for any JavaScript errors
   - Verify RLS policies are not blocking read access

### Development vs Production

- For development: Use `http://localhost:5174` as your site URL
- For production: Update the site URL to your deployed domain
- Always use environment variables for sensitive data

## Next Steps

1. **Semantic Search**: The `content_vector` field is ready for implementing semantic search using Supabase's vector capabilities
2. **File Storage**: Consider using Supabase Storage for image uploads
3. **Analytics**: Implement view tracking and analytics
4. **Comments**: Add a comments system using Supabase

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the Supabase logs in your dashboard
3. Ensure all environment variables are set correctly
4. Verify your database schema matches the provided SQL file