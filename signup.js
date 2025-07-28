import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orztieawpqbcnfyyyilk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yenRpZWF3cHFiY25meXl5aWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzAxMDksImV4cCI6MjA2ODQwNjEwOX0.Qk683oVO-CI6tId9YroErL-u7dAJ2glwNHhPdWjkLh8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@blog.com',
    password: 'admin123',
  });

  if (error) {
    console.error('Error signing up:', error);
    return;
  }

  console.log('User signed up:', data);
}

signUpNewUser();
