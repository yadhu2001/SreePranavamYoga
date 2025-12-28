import { supabase } from '../lib/supabase';

export interface PageSettings {
  [key: string]: string;
}

export async function loadPageSettings(page: string): Promise<PageSettings> {
  const { data } = await supabase
    .from('page_settings')
    .select('key, value')
    .eq('page', page);

  if (data) {
    return data.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as PageSettings);
  }

  return {};
}

export function createGetSetting(settings: PageSettings) {
  return (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };
}
