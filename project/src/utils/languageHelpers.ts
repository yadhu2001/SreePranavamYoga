import { supabase } from '../lib/supabase';

export function createLanguageQuery(tableName: string, languageCode: string) {
  return supabase.from(tableName).select('*').eq('language_code', languageCode);
}

export function addLanguageFilter(query: any, languageCode: string) {
  return query.eq('language_code', languageCode);
}
