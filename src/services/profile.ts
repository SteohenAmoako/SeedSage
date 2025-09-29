import { supabase } from '@/lib/supabase';

export interface UserProfile {
  username: string;
}

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) return null; // Gracefully handle no-config case

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    if (data) {
      return data as UserProfile;
    }

    return null;

  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};

export const saveProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
  if (!supabase) return false; // Gracefully handle no-config case
  
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, username: profile.username });

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error writing document:', error);
    return false;
  }
};
