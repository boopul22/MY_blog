# Gemini Blog Platform

A feature-rich blog platform built with React, TypeScript, and Supabase, enhanced with WordPress-like functionality including advanced WYSIWYG editing, comprehensive SEO features, and AI-powered content management.

## Features

### Content Management
- **Rich Text Editing**: Advanced WYSIWYG editor with TinyMCE
- **AI-Powered Content**: Generate blog posts and SEO metadata using Gemini AI
- **Real-time Notifications**: Toast notifications for all user actions
- **Draft & Publish Workflow**: Clear status indicators and publishing feedback
- **Keyboard Shortcuts**: Ctrl+S to save draft, Ctrl+Shift+P to publish

### Admin Dashboard
- **Collapsible Sidebar**: Maximize content area with expandable/collapsible navigation
- **Responsive Design**: Mobile-friendly with overlay sidebar on smaller screens
- **Persistent State**: Sidebar preferences saved to localStorage
- **Accessibility**: Full keyboard navigation and screen reader support

### User Experience
- **Full-Viewport Design**: Non-scrollable UI with fixed-height containers
- **Multi-Column Layouts**: Efficient content organization
- **Dark Mode Support**: Complete dark/light theme switching
- **Loading States**: Clear feedback during all operations

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your `GEMINI_API_KEY` and Supabase credentials

3. Run the development server:
   ```bash
   npm run dev
   ```

## Keyboard Shortcuts

- **Ctrl+S** (Cmd+S on Mac): Save draft
- **Ctrl+Shift+P** (Cmd+Shift+P on Mac): Publish post
- **Escape**: Close mobile sidebar

## Architecture

- **Frontend**: React 19.1.0 with TypeScript
- **Styling**: TailwindCSS 4.1.11
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini API
- **State Management**: React Context with localStorage persistence
