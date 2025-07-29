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

## 🚨 CRITICAL: FUNCTION HANDLING - DO NOT BREAK FUNCTIONS! 🚨

### ABSOLUTE FUNCTION RULES - NEVER VIOLATE THESE:

**⚠️ FUNCTION PRESERVATION IS MANDATORY ⚠️**
- **NEVER** modify existing function signatures without explicit user request
- **NEVER** change function parameter names, types, or order
- **NEVER** alter function return types or behavior
- **ALWAYS** preserve backward compatibility
- **ALWAYS** test function calls after ANY modification

### 1. FUNCTION TYPING REQUIREMENTS (MANDATORY)
**Every function MUST have explicit types:**

```typescript
// ✅ CORRECT - Always do this
function processData(input: string, options: ProcessOptions): Promise<ProcessResult> {
  // implementation
}

// ✅ CORRECT - Arrow functions with types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  // implementation
}

// ✅ CORRECT - Generic functions
function mapArray<T, U>(items: T[], mapper: (item: T) => U): U[] {
  return items.map(mapper);
}

// ❌ WRONG - Never do this
function processData(input, options) { // Missing types!
  // implementation
}
```

**TYPING RULES:**
- **ALWAYS type function parameters and return values explicitly**
- Use generic types for reusable functions: `function func<T>(param: T): T`
- Define interfaces for complex function parameters
- Use union types for functions that accept multiple parameter types
- Never use `any` - prefer `unknown` for uncertain types

### 2. FUNCTION DECLARATION PATTERNS

**Choose the right pattern:**
```typescript
// ✅ Arrow functions for simple expressions
const getValue = (): string => "value";
const transform = (x: number): number => x * 2;

// ✅ Function declarations for complex logic
function complexCalculation(data: DataType[]): ResultType {
  // Complex implementation
  return result;
}

// ✅ Async functions with proper typing
async function fetchUserData(id: string): Promise<User | null> {
  try {
    const response = await api.getUser(id);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```

### 3. FUNCTION SAFETY PROTOCOLS

**ALWAYS implement these safety measures:**

```typescript
// ✅ Check function existence
if (typeof callback === 'function') {
  callback(result);
}

// ✅ Use optional chaining
obj?.method?.();
user?.profile?.updateSettings?.(newSettings);

// ✅ Proper error handling
try {
  const result = await riskyFunction();
  return result;
} catch (error) {
  console.error('Function failed:', error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

### 4. ASYNC FUNCTION HANDLING (CRITICAL)

**Async function rules - NEVER violate:**

```typescript
// ✅ CORRECT - Proper async/await
async function handleSubmit(data: FormData): Promise<void> {
  try {
    setLoading(true);
    await submitData(data);
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

// ✅ CORRECT - Parallel operations
async function loadAllData(): Promise<[Users[], Posts[]]> {
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts()
  ]);
  return [users, posts];
}

// ❌ WRONG - Never mix patterns
async function badExample() {
  await someFunction().then(result => { // DON'T MIX!
    // This is wrong
  });
}
```

### 5. REACT FUNCTION COMPONENTS & HOOKS

**React function rules:**

```typescript
// ✅ CORRECT - Proper component typing
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  // ✅ Hooks at top level only
  const [state, setState] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ useCallback for event handlers
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(new FormData(event.target as HTMLFormElement));
  }, [onSubmit]);

  // ✅ Cleanup in useEffect
  useEffect(() => {
    const cleanup = setupEventListener();
    return cleanup; // Always cleanup
  }, []);

  return <form onSubmit={handleSubmit}>{/* JSX */}</form>;
};
```

**HOOK RULES (NEVER BREAK):**
- Never call hooks conditionally or inside loops
- Always use hooks at the top level of components
- Custom hooks must start with "use" prefix
- Clean up effects properly to prevent memory leaks

### 6. API FUNCTION CALLS

**API function template:**

```typescript
async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    setLoading(true);

    const response = await fetch(endpoint, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
}
```

### 7. FUNCTION TESTING REQUIREMENTS

**ALWAYS test functions:**
- Test all functions after modifications
- Verify function return types match expectations
- Ensure functions handle edge cases properly
- Mock external function dependencies in tests
- Test error conditions and edge cases

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
- Create comprehensive interfaces for complex data structures
- Use discriminated unions for type safety with variants
- Implement proper null/undefined handling with strict mode

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

1. **🚨 FUNCTIONS FIRST**: Before ANY code changes, review the CRITICAL Function Handling section above
2. **Maintain Architecture**: Respect the React/TypeScript patterns established
3. **UI Consistency**: Follow the full-viewport, non-scrollable design principles
4. **Database Operations**: Use Supabase client properly with error handling
5. **AI Features**: Integrate Gemini API calls appropriately with fallbacks
6. **Performance**: Consider React Compiler optimizations in suggestions
7. **Testing**: Suggest test implementations for new features
8. **Documentation**: Update relevant documentation when making changes

### 🔥 FUNCTION SAFETY CHECKLIST - VERIFY BEFORE EVERY CHANGE:
- [ ] Are all function parameters and return types explicitly typed?
- [ ] Are existing function signatures preserved?
- [ ] Are async functions handled with proper try-catch?
- [ ] Are React hooks used correctly (top-level, proper cleanup)?
- [ ] Are event handlers properly typed and bound?
- [ ] Are API calls wrapped with error handling?
- [ ] Are all functions tested after modifications?

**REMEMBER: Breaking functions breaks the entire application. When in doubt, ask for clarification rather than guessing function behavior.**

Always prioritize user experience, code maintainability, and performance optimization while adhering to the established architectural patterns.
