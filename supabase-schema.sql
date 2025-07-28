-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table with vector column for semantic search and WordPress-like features
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT, -- WordPress-like excerpt
  slug VARCHAR(500) NOT NULL UNIQUE,
  image_url TEXT, -- Featured image
  image_caption TEXT, -- Featured image caption
  image_alt_text TEXT, -- Featured image alt text
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'private', 'scheduled')),
  seo_title VARCHAR(500) NOT NULL,
  seo_description TEXT NOT NULL,
  meta_keywords TEXT,
  focus_keyword TEXT, -- SEO focus keyword
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL DEFAULT 'Admin',
  word_count INTEGER DEFAULT 0, -- Automatic word count
  reading_time INTEGER DEFAULT 0, -- Estimated reading time in minutes
  allow_comments BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Featured post flag
  template VARCHAR(100) DEFAULT 'default', -- Post template
  custom_css TEXT, -- Custom CSS for the post
  custom_js TEXT, -- Custom JavaScript for the post
  scheduled_at TIMESTAMP WITH TIME ZONE, -- For scheduled posts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content_vector vector(1536) -- OpenAI embedding dimension
);

-- Create post_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Create media library table for WordPress-like media management
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- image/jpeg, image/png, etc.
  file_size INTEGER NOT NULL, -- Size in bytes
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER, -- For images
  height INTEGER, -- For images
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  title VARCHAR(255),
  uploaded_by VARCHAR(255) DEFAULT 'Admin',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media usage tracking table
CREATE TABLE IF NOT EXISTS media_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL, -- 'featured_image', 'content_image', 'gallery', etc.
  usage_context TEXT, -- Additional context about how the media is used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_posts_content_vector ON posts USING ivfflat (content_vector vector_cosine_ops) WITH (lists = 100);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Trigger to automatically update updated_at on posts
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for semantic search using vector similarity
CREATE OR REPLACE FUNCTION match_posts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  slug text,
  similarity float
)
LANGUAGE plpgsql
AS $
BEGIN
  RETURN QUERY
  SELECT
    posts.id,
    posts.title,
    posts.content,
    posts.slug,
    1 - (posts.content_vector <=> query_embedding) AS similarity
  FROM posts
  WHERE posts.content_vector IS NOT NULL
    AND posts.status = 'published'
    AND 1 - (posts.content_vector <=> query_embedding) > match_threshold
  ORDER BY posts.content_vector <=> query_embedding
  LIMIT match_count;
END;
$;

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to post_tags" ON post_tags
  FOR SELECT USING (true);

-- Create policies for authenticated admin users (full access)
CREATE POLICY "Allow authenticated users full access to posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to tags" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to post_tags" ON post_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial categories
INSERT INTO categories (id, name, slug) VALUES
  ('6091e961-2cd5-456b-9e48-a933c1270872', 'Technology', 'technology'),
  ('458b8fb8-b25e-4da5-9f49-37a5e0f783c4', 'Programming', 'programming'),
  ('76d99fa5-afd2-4dde-a7fb-87b9a6e14cc4', 'Design', 'design'),
  ('41b43662-9a7b-4bed-b30e-939a2bca8770', 'Business', 'business'),
  ('e464e512-4914-4e8e-a2ed-282d2d9159c7', 'Lifestyle', 'lifestyle')
ON CONFLICT (id) DO NOTHING;

-- Insert initial tags
INSERT INTO tags (id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'React'),
  ('550e8400-e29b-41d4-a716-446655440012', 'AI'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Web Dev'),
  ('550e8400-e29b-41d4-a716-446655440014', 'UX')
ON CONFLICT (id) DO NOTHING;

-- Insert initial posts
INSERT INTO posts (id, title, content, slug, image_url, status, seo_title, seo_description, category_id, author_name, created_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440021',
    'Discover Your Best Self: A Journey to a Vibrant Lifestyle',
    'A vibrant lifestyle is about more than just fleeting moments of happiness; it''s a sustained state of well-being, energy, and enthusiasm for life. It''s about making conscious choices that nourish your mind, body, and soul. This journey begins with self-discovery. Understanding your values, passions, and what truly makes you feel alive is the foundation upon which you can build a more fulfilling existence. It requires introspection and honesty, and sometimes, the courage to let go of what no longer serves you.',
    'discover-your-best-self',
    'https://images.unsplash.com/photo-1542359649-31e03cdde433?q=80&w=2940&auto=format&fit=crop',
    'published',
    'Discover Your Best Self: A Journey to a Vibrant Lifestyle',
    'Embark on a journey of self-discovery to unlock a more vibrant, fulfilling lifestyle. Learn to align your actions with your values for lasting well-being.',
    '6091e961-2cd5-456b-9e48-a933c1270872',
    'Marquise Wiszok',
    '2024-12-27T00:00:00Z'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    'The Art of Mindful Living: Transforming Your Lifestyle for Inner Peace',
    'In our fast-paced world, finding moments of peace can feel like a luxury. Mindful living offers a path back to ourselves, a way to transform our daily routines into opportunities for awareness and calm. It''s the practice of paying attention to the present moment without judgment. This can be as simple as savoring your morning coffee, feeling the ground beneath your feet as you walk, or truly listening to a friend. Mindfulness isn''t about emptying your mind, but about observing your thoughts and feelings as they are.',
    'art-of-mindful-living',
    'https://images.unsplash.com/photo-1508447650322-2c5b3b14644d?q=80&w=2940&auto=format&fit=crop',
    'published',
    'The Art of Mindful Living: A Guide to Inner Peace',
    'Transform your life and find inner peace through the art of mindful living. Discover simple practices to bring awareness and calm to your daily routine.',
    '76d99fa5-afd2-4dde-a7fb-87b9a6e14cc4',
    'Mable Chaplin',
    '2024-12-27T00:00:00Z'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    'Top 5 Productivity Hacks for Developers',
    'Being productive is key. Here are five hacks to boost your output:\n\n1.  **Timeboxing**: Allocate fixed time slots to tasks.\n2.  **The Pomodoro Technique**: Work in focused 25-minute intervals.\n3.  **Learn Your Tools**: Master your IDE and shortcuts.\n4.  **Automate Repetitive Tasks**: Scripts are your friend.\n5.  **Take Regular Breaks**: Avoid burnout.',
    'top-5-productivity-hacks-for-developers',
    'https://picsum.photos/seed/productivity/1200/630',
    'published',
    '5 Productivity Hacks for Developers to Get More Done',
    'Boost your efficiency with these top 5 productivity hacks, including timeboxing, the Pomodoro Technique, and more.',
    'e464e512-4914-4e8e-a2ed-282d2d9159c7',
    'Admin',
    '2024-12-20T00:00:00Z'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440024',
    'My First Draft',
    'This is a draft post. It is not yet visible to the public.',
    'my-first-draft',
    NULL,
    'draft',
    'Draft Post',
    'This is a draft.',
    'e464e512-4914-4e8e-a2ed-282d2d9159c7',
    'Admin',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert post-tag relationships
INSERT INTO post_tags (post_id, tag_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440014'), -- Post 1 -> UX
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440011'), -- Post 3 -> React
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440013'), -- Post 3 -> Web Dev
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440014')  -- Post 4 -> UX
ON CONFLICT (post_id, tag_id) DO NOTHING;

-- Enhanced WordPress-like features

-- Create post types table for custom post types
CREATE TABLE IF NOT EXISTS post_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  public BOOLEAN DEFAULT true,
  hierarchical BOOLEAN DEFAULT false,
  supports TEXT[] DEFAULT '{"title", "content", "author", "thumbnail", "excerpt", "comments"}',
  menu_position INTEGER DEFAULT 5,
  menu_icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default post types
INSERT INTO post_types (name, label, description, public, hierarchical, supports) VALUES
('post', 'Posts', 'Blog posts and articles', true, false, '{"title", "content", "author", "thumbnail", "excerpt", "comments", "tags", "categories"}'),
('page', 'Pages', 'Static pages', true, true, '{"title", "content", "author", "thumbnail", "excerpt"}'),
('portfolio', 'Portfolio', 'Portfolio items', true, false, '{"title", "content", "author", "thumbnail", "excerpt"}')
ON CONFLICT (name) DO NOTHING;

-- Create post revisions table for version control
CREATE TABLE IF NOT EXISTS post_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  seo_title VARCHAR(500),
  seo_description TEXT,
  meta_keywords TEXT,
  custom_fields JSONB DEFAULT '{}',
  revision_type VARCHAR(20) DEFAULT 'revision' CHECK (revision_type IN ('revision', 'autosave')),
  author_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post meta table for custom fields
CREATE TABLE IF NOT EXISTS post_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  meta_key VARCHAR(255) NOT NULL,
  meta_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled posts table for publishing workflow
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content templates table
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) DEFAULT 'post' CHECK (template_type IN ('post', 'page', 'email', 'custom')),
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reusable blocks table
CREATE TABLE IF NOT EXISTS reusable_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  block_type VARCHAR(50) DEFAULT 'custom' CHECK (block_type IN ('text', 'image', 'video', 'code', 'quote', 'custom')),
  content TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing posts table (if they don't exist)
DO $$
BEGIN
  -- Add excerpt column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'excerpt') THEN
    ALTER TABLE posts ADD COLUMN excerpt TEXT;
  END IF;

  -- Add post_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'post_type') THEN
    ALTER TABLE posts ADD COLUMN post_type VARCHAR(100) DEFAULT 'post';
  END IF;

  -- Add parent_id column for hierarchical posts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'parent_id') THEN
    ALTER TABLE posts ADD COLUMN parent_id UUID REFERENCES posts(id) ON DELETE SET NULL;
  END IF;

  -- Add menu_order column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'menu_order') THEN
    ALTER TABLE posts ADD COLUMN menu_order INTEGER DEFAULT 0;
  END IF;

  -- Add comment_status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comment_status') THEN
    ALTER TABLE posts ADD COLUMN comment_status VARCHAR(20) DEFAULT 'open' CHECK (comment_status IN ('open', 'closed'));
  END IF;

  -- Add password column for protected posts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'password') THEN
    ALTER TABLE posts ADD COLUMN password VARCHAR(255);
  END IF;

  -- Add scheduled_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'scheduled_at') THEN
    ALTER TABLE posts ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add published_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'published_at') THEN
    ALTER TABLE posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add custom_fields column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'custom_fields') THEN
    ALTER TABLE posts ADD COLUMN custom_fields JSONB DEFAULT '{}';
  END IF;

  -- Update status check constraint to include new statuses
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
  ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('published', 'draft', 'scheduled', 'private', 'archived', 'trash'));
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_post_revisions_post_id ON post_revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_revisions_created_at ON post_revisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_meta_post_id ON post_meta(post_id);
CREATE INDEX IF NOT EXISTS idx_post_meta_key ON post_meta(meta_key);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- Create triggers for updated_at columns
CREATE TRIGGER update_post_types_updated_at BEFORE UPDATE ON post_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_meta_updated_at BEFORE UPDATE ON post_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reusable_blocks_updated_at BEFORE UPDATE ON reusable_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create post revision
CREATE OR REPLACE FUNCTION create_post_revision(
  p_post_id UUID,
  p_revision_type VARCHAR DEFAULT 'revision'
)
RETURNS UUID
LANGUAGE plpgsql
AS $
DECLARE
  revision_id UUID;
  post_record RECORD;
BEGIN
  -- Get current post data
  SELECT * INTO post_record FROM posts WHERE id = p_post_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  -- Create revision
  INSERT INTO post_revisions (
    post_id, title, content, excerpt, seo_title, seo_description,
    meta_keywords, custom_fields, revision_type, author_name
  ) VALUES (
    p_post_id, post_record.title, post_record.content, post_record.excerpt,
    post_record.seo_title, post_record.seo_description, post_record.meta_keywords,
    post_record.custom_fields, p_revision_type, post_record.author_name
  ) RETURNING id INTO revision_id;

  RETURN revision_id;
END;
$;

-- Function to restore post from revision
CREATE OR REPLACE FUNCTION restore_post_from_revision(
  p_post_id UUID,
  p_revision_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $
DECLARE
  revision_record RECORD;
BEGIN
  -- Get revision data
  SELECT * INTO revision_record FROM post_revisions
  WHERE id = p_revision_id AND post_id = p_post_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revision not found';
  END IF;

  -- Create current revision before restoring
  PERFORM create_post_revision(p_post_id, 'revision');

  -- Update post with revision data
  UPDATE posts SET
    title = revision_record.title,
    content = revision_record.content,
    excerpt = revision_record.excerpt,
    seo_title = revision_record.seo_title,
    seo_description = revision_record.seo_description,
    meta_keywords = revision_record.meta_keywords,
    custom_fields = revision_record.custom_fields,
    updated_at = NOW()
  WHERE id = p_post_id;

  RETURN TRUE;
END;
$;

-- Function to publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $
DECLARE
  published_count INTEGER := 0;
  scheduled_post RECORD;
BEGIN
  -- Get posts that should be published
  FOR scheduled_post IN
    SELECT sp.*, p.id as post_id
    FROM scheduled_posts sp
    JOIN posts p ON sp.post_id = p.id
    WHERE sp.status = 'pending'
    AND sp.scheduled_at <= NOW()
    AND p.status = 'scheduled'
  LOOP
    BEGIN
      -- Update post status to published
      UPDATE posts SET
        status = 'published',
        published_at = NOW(),
        updated_at = NOW()
      WHERE id = scheduled_post.post_id;

      -- Update scheduled post status
      UPDATE scheduled_posts SET
        status = 'published',
        last_attempt_at = NOW(),
        updated_at = NOW()
      WHERE id = scheduled_post.id;

      published_count := published_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Log error and mark as failed
      UPDATE scheduled_posts SET
        status = 'failed',
        attempts = attempts + 1,
        last_attempt_at = NOW(),
        error_message = SQLERRM,
        updated_at = NOW()
      WHERE id = scheduled_post.id;
    END;
  END LOOP;

  RETURN published_count;
END;
$;

-- Enable RLS for new tables
ALTER TABLE post_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reusable_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow public read access to post_types" ON post_types
  FOR SELECT USING (public = true);

CREATE POLICY "Allow authenticated users full access to post_types" ON post_types
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to post_revisions" ON post_revisions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to post_meta" ON post_meta
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to scheduled_posts" ON scheduled_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to content_templates" ON content_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users full access to content_templates" ON content_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to reusable_blocks" ON reusable_blocks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users full access to reusable_blocks" ON reusable_blocks
  FOR ALL USING (auth.role() = 'authenticated');

