import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  site_name: string;
  logo_url: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('site_name, logo_url')
        .limit(1)
        .maybeSingle();

      if (data) setSettings(data);
    };

    load();
  }, []);

  return settings;
}
