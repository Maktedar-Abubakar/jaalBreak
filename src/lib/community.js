// ---------------------------------------------------------------------------
// Community scam reports (Supabase table: community_reports, see
// supabase/community.sql). Shares ONLY the scam type, risk level, tactic names,
// language and channel — never the message, links, numbers or who you are.
// Individual reports can't be read back by anyone; only totals are public.
// ---------------------------------------------------------------------------
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export { CHANNELS, buildCommunityReport } from '../utils/communityReport.js';
import { buildCommunityReport } from '../utils/communityReport.js';

export const communityAvailable = isSupabaseConfigured;

function client() {
  if (!supabase) throw new Error('Community reports need the online database, which is not set up in this version.');
  return supabase;
}

export async function shareCommunityReport(result, channel) {
  if (result.band.key === 'low') throw new Error('Only messages with warning signs can be shared.');
  const { error } = await client().from('community_reports').insert(buildCommunityReport(result, channel));
  if (error) throw new Error('Could not share right now. Please try again later.', { cause: error });
}

export async function fetchTrending(days = 7) {
  const { data, error } = await client().rpc('trending_scams', { days });
  if (error) throw new Error('Could not load community trends right now.', { cause: error });
  return (data || []).map((r) => ({ category: r.category, reports: Number(r.reports) }));
}

export async function fetchDaily(days = 14) {
  const { data, error } = await client().rpc('trending_daily', { days });
  if (error) throw new Error('Could not load community trends right now.', { cause: error });
  return (data || []).map((r) => ({ day: r.day, reports: Number(r.reports) }));
}
