import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PlatformSettingsMap = Record<string, string>;

export function usePlatformSettings(keys?: string[]) {
  const [settings, setSettings] = useState<PlatformSettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from('platform_settings').select('key, value');
      if (keys && keys.length > 0) {
        query = query.in('key', keys);
      }
      const { data } = await query;
      const map: PlatformSettingsMap = {};
      (data || []).forEach((d: any) => {
        map[d.key] = typeof d.value === 'string' ? d.value : JSON.stringify(d.value);
      });
      setSettings(map);
      setLoading(false);
    };
    load();
  }, []);

  return { settings, loading };
}
