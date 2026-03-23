import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  preferences: {
    theme: string;
    language: string;
    voice_enabled: boolean;
    email_notifications: boolean;
    system_alerts: boolean;
    chat_notifications: boolean;
  };
}

const defaultPreferences = {
  theme: 'system',
  language: 'en',
  voice_enabled: true,
  email_notifications: true,
  system_alerts: true,
  chat_notifications: true,
};

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Merge default preferences with stored preferences
      const storedPreferences = (typeof data?.preferences === 'object' && data?.preferences !== null) 
        ? data.preferences as Record<string, unknown>
        : {};
      const mergedPreferences = { ...defaultPreferences, ...storedPreferences };

      setProfile({
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        email: user.email || data?.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        role: data.role || 'student',
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        last_login: data.last_login,
        preferences: mergedPreferences as ProfileData['preferences'],
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user?.id || !profile) return;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updatePreferences = async (newPreferences: Partial<ProfileData['preferences']>) => {
    if (!user?.id || !profile) return;

    const updatedPreferences = {
      ...profile.preferences,
      ...newPreferences,
    };

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, preferences: updatedPreferences } : null);
      
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    refetch: fetchProfile,
  };
};
