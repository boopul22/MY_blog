# Gemini Blog Platform - AI Assistant Guidelines

## Project Overview

This is a feature-rich blog platform built with React, TypeScript, and Supabase, enhanced with WordPress-like functionality including advanced WYSIWYG editing, comprehensive SEO features, and AI-powered content management. The platform maintains a modern React/TypeScript architecture while providing a full-viewport, non-scrollable UI design with fixed-height containers and multi-column layouts.

## Technology Stack

- **Frontend**: React 19.1.0, TypeScript, Vite
- **Styling**: TailwindCSS 4.1.11 with custom design system
- **Database**: Supabase (PostgreSQL with real-time features)
- **AI Integration**: Google Gemini API (@google/genai)
- **Rich Text Editing**: React Quill, TinyMCE
- **Routing**: React Router DOM 7.7.1
- **Additional**: React Markdown, Recharts, Highlight.js

## Architecture Principles

### React Development Guidelines
- Use functional components with Hooks exclusively
- Maintain pure, side-effect-free rendering
- Respect one-way data flow with props and context
- Never mutate state directly - always use immutable updates
- Minimize useEffect usage - prefer event handlers for user actions
- Follow Rules of Hooks consistently
- Prefer composition and small, reusable components
- Optimize for React's concurrent rendering features

### TypeScript Best Practices
- Prefer plain JavaScript objects with TypeScript interfaces over classes
- Use ES module syntax (import/export) for encapsulation
- Avoid `any` types - prefer `unknown` for uncertain types
- Use type assertions sparingly and with caution
- Leverage JavaScript's array operators (.map(), .filter(), .reduce())

### UI/UX Design Preferences
- **Full-viewport layouts**: Design components to fit within visible screen area
- **Non-scrollable interfaces**: Use fixed-height containers with internal scrolling
- **Multi-column layouts**: Organize content in efficient column structures
- **Compact form controls**: Minimize vertical space usage
- **Responsive design**: Ensure layouts work across all screen sizes

## Project Structure

```
/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── pages/              # Route components
│   │   ├── admin/          # Admin dashboard pages
│   │   └── public/         # Public blog pages
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── WireFrame/             # Design wireframes
└── docs/                  # Documentation files
```

## Key Features

### Content Management
- Rich text editing with React Quill and TinyMCE
- AI-powered content generation using Gemini API
- SEO optimization with meta tags, structured data
- Category and tag management
- Image compression and optimization
- Real-time collaborative editing

### Database Schema (Supabase)
- `posts` - Blog posts with SEO fields and content vectors
- `categories` - Content categorization
- `tags` - Flexible tagging system
- `post_tags` - Many-to-many relationships
- Row Level Security (RLS) policies implemented

### AI Integration
- Content generation and enhancement
- SEO metadata generation
- Image generation capabilities
- Semantic search preparation (vector storage)

## Development Guidelines

### Code Quality
- Run `npm run preflight` before submitting changes
- Write tests using Vitest framework
- Follow existing patterns and conventions
- Use descriptive variable and function names
- Write high-value comments only when necessary

### State Management
- Use React Context for global state (BlogContext, ThemeContext)
- Prefer local state with useState for component-specific data
- Implement proper error boundaries
- Handle loading states gracefully

### Performance Optimization
- Leverage React Compiler optimizations
- Avoid premature optimization with manual memoization
- Use Suspense for data loading
- Implement parallel data fetching where possible
- Minimize network waterfalls

## Environment Configuration

Required environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing Strategy

- Use Vitest for all testing
- Co-locate test files with source files
- Mock external dependencies appropriately
- Test public APIs, not implementation details
- Include cleanup functions in effects
- Use `vi.mock()` for ES modules and external libraries

## Deployment

- **Development**: `npm run dev` (Vite dev server)
- **Production**: `npm run build` (Vite build)
- **Platform**: Vercel deployment configured
- **Database**: Supabase hosted PostgreSQL

## Security Considerations

- Row Level Security (RLS) enabled on all Supabase tables
- Environment variables for sensitive data
- Input validation and sanitization
- Secure authentication flow
- CORS configuration for API access

## AI Assistant Instructions

When working on this project:

1. **Maintain Architecture**: Respect the React/TypeScript patterns established
2. **UI Consistency**: Follow the full-viewport, non-scrollable design principles
3. **Database Operations**: Use Supabase client properly with error handling
4. **AI Features**: Integrate Gemini API calls appropriately with fallbacks
5. **Performance**: Consider React Compiler optimizations in suggestions
6. **Testing**: Suggest test implementations for new features
7. **Documentation**: Update relevant documentation when making changes

Always prioritize user experience, code maintainability, and performance optimization while adhering to the established architectural patterns.
