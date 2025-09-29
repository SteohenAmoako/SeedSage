import { supabase, supabaseAdmin } from '@/lib/supabase';

export interface UserProfile {
  username: string;
}

// This function runs on the client
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) return null; // Gracefully handle no-config case

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    // PGRST116: No rows found. This is not an error for us.
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? (data as UserProfile) : null;

  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};


// This function should only be called from a server action
export const saveProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
  // Use the admin client to bypass RLS
  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized. Cannot save profile.");
    return false;
  }
  
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, username: profile.username, updated_at: new Date().toISOString() });

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};
