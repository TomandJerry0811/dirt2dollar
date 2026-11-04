
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function RealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) {
      console.warn(
        'Supabase Realtime disabled: frontend environment variables are missing.'
      );
      return;
    }

    const channel = supabase
      .channel('client-updates-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_updates',
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ['clients'],
          });

          void queryClient.invalidateQueries({
            queryKey: ['client'],
          });

          void queryClient.invalidateQueries({
            queryKey: ['dashboard'],
          });
        }
      )
      .subscribe((status: string) => {
        if (import.meta.env.DEV) {
          console.info('Supabase Realtime status:', status);
        }
      });

    return () => {
  if (supabase) {
    void supabase.removeChannel(channel);
  }
};
  }, [queryClient]);

  return null;
}
