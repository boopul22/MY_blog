import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orztieawpqbcnfyyyilk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yenRpZWF3cHFiY25meXl5aWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzAxMDksImV4cCI6MjA2ODQwNjEwOX0.Qk683oVO-CI6tId9YroErL-u7dAJ2glwNHhPdWjkLh8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthAndPost() {
  console.log('Testing authentication and post creation...');
  
  try {
    // First, try to sign in
    console.log('Attempting to sign in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adityapathak1501@gmail.com',
      password: 'bipul281B#@#',
    });

    if (authError) {
      console.error('Authentication failed:', authError);
      return;
    }

    console.log('Authentication successful:', authData.user.email);
    console.log('User role:', authData.user.role);
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    
    console.log('Current session:', session ? 'Active' : 'None');
    console.log('Session user:', session?.user?.email);

    // Now try to create a post
    console.log('Attempting to create a post...');
    const testPost = {
      title: 'Test Post with Auth',
      content: 'This is a test post created with authentication.',
      slug: 'test-post-auth-' + Date.now(),
      status: 'draft',
      seo_title: 'Test Post SEO Title',
      seo_description: 'Test post SEO description',
      category_id: '6091e961-2cd5-456b-9e48-a933c1270872', // Technology category
      author_name: 'Authenticated Admin'
    };

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert(testPost)
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return;
    }

    console.log('Post created successfully:', postData);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAuthAndPost();
