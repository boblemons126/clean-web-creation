
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CalendarAccount {
  id: string;
  account_name: string;
  provider_id: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
  provider: {
    name: string;
    auth_type: string;
  };
}

export const useCalendarAccounts = () => {
  const [accounts, setAccounts] = useState<CalendarAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_calendar_accounts')
        .select(`
          *,
          provider:calendar_providers(*)
        `)
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching calendar accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calendar accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (provider: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-auth', {
        body: { provider: provider.toLowerCase(), action: 'getAuthUrl' }
      });

      if (error) throw error;

      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=600');
      } else if (data.message) {
        toast({
          title: "Setup Required",
          description: data.message
        });
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      toast({
        title: "Error",
        description: "Failed to connect calendar account",
        variant: "destructive"
      });
    }
  };

  const syncAccount = async (accountId: string, provider: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { accountId, provider }
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.eventsCount} events`,
      });

      await fetchAccounts();
    } catch (error) {
      console.error('Error syncing account:', error);
      toast({
        title: "Error",
        description: "Failed to sync calendar account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('user_calendar_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Calendar account disconnected"
      });

      await fetchAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive"
      });
    }
  };

  return {
    accounts,
    loading,
    connectAccount,
    syncAccount,
    disconnectAccount,
    refreshAccounts: fetchAccounts
  };
};
