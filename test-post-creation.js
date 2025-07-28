import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orztieawpqbcnfyyyilk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yenRpZWF3cHFiY25meXl5aWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzAxMDksImV4cCI6MjA2ODQwNjEwOX0.Qk683oVO-CI6tId9YroErL-u7dAJ2glwNHhPdWjkLh8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPostCreation() {
  console.log('Testing post creation...');
  
  const testPost = {
    title: 'Test Post from Script',
    content: 'This is a test post created from a script to verify the database connection.',
    slug: 'test-post-' + Date.now(),
    status: 'draft',
    seo_title: 'Test Post SEO Title',
    seo_description: 'Test post SEO description',
    category_id: '6091e961-2cd5-456b-9e48-a933c1270872', // Technology category
    author_name: 'Test Admin'
  };

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(testPost)
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return;
    }

    console.log('Post created successfully:', data);
    
    // Test updating the post
    const { data: updatedData, error: updateError } = await supabase
      .from('posts')
      .update({ title: 'Updated Test Post' })
      .eq('id', data.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating post:', updateError);
      return;
    }
    
    console.log('Post updated successfully:', updatedData);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testPostCreation();
