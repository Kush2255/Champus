import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ChatStats {
  totalChats: number;
  textChats: number;
  voiceChats: number;
  textVoiceRatio: number;
  todayChats: number;
  weeklyChats: number;
  monthlyChats: number;
  avgResponseLength: number;
}

interface DailyUsage {
  date: string;
  text: number;
  voice: number;
  total: number;
}

interface AnalyticsData {
  stats: ChatStats;
  dailyUsage: DailyUsage[];
  recentActivity: Array<{
    id: string;
    type: string;
    query: string;
    timestamp: Date;
  }>;
  isLoading: boolean;
  error: string | null;
}

export const useAnalytics = (): AnalyticsData => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ChatStats>({
    totalChats: 0,
    textChats: 0,
    voiceChats: 0,
    textVoiceRatio: 0,
    todayChats: 0,
    weeklyChats: 0,
    monthlyChats: 0,
    avgResponseLength: 0,
  });
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [recentActivity, setRecentActivity] = useState<AnalyticsData['recentActivity']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch all chat history for the user
        const { data: chats, error: chatError } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (chatError) throw chatError;

        if (!chats || chats.length === 0) {
          setIsLoading(false);
          return;
        }

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const textChats = chats.filter(c => c.input_type === 'text' || !c.input_type).length;
        const voiceChats = chats.filter(c => c.input_type === 'voice').length;
        const todayChats = chats.filter(c => new Date(c.created_at) >= today).length;
        const weeklyChats = chats.filter(c => new Date(c.created_at) >= weekAgo).length;
        const monthlyChats = chats.filter(c => new Date(c.created_at) >= monthAgo).length;
        
        const avgResponseLength = chats.reduce((acc, c) => acc + (c.ai_response?.length || 0), 0) / chats.length;

        setStats({
          totalChats: chats.length,
          textChats,
          voiceChats,
          textVoiceRatio: textChats > 0 ? voiceChats / textChats : 0,
          todayChats,
          weeklyChats,
          monthlyChats,
          avgResponseLength: Math.round(avgResponseLength),
        });

        // Calculate daily usage for the last 7 days
        const dailyData: Record<string, DailyUsage> = {};
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          dailyData[dateStr] = { date: dateStr, text: 0, voice: 0, total: 0 };
        }

        chats.forEach(chat => {
          const chatDate = new Date(chat.created_at);
          if (chatDate >= weekAgo) {
            const dateStr = chatDate.toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyData[dateStr]) {
              dailyData[dateStr].total++;
              if (chat.input_type === 'voice') {
                dailyData[dateStr].voice++;
              } else {
                dailyData[dateStr].text++;
              }
            }
          }
        });

        setDailyUsage(Object.values(dailyData));

        // Recent activity (last 5)
        setRecentActivity(
          chats.slice(0, 5).map(chat => ({
            id: chat.id,
            type: chat.input_type || 'text',
            query: chat.user_query.substring(0, 50) + (chat.user_query.length > 50 ? '...' : ''),
            timestamp: new Date(chat.created_at),
          }))
        );

        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return { stats, dailyUsage, recentActivity, isLoading, error };
};
