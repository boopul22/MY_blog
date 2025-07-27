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

-- Create posts table with vector column for semantic search
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  seo_title VARCHAR(500) NOT NULL,
  seo_description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL DEFAULT 'Admin',
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

