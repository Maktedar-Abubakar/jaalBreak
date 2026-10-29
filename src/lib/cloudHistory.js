// ---------------------------------------------------------------------------
// Scan history for SIGNED-IN users, stored in Supabase (table: scan_history).
// Guests keep using localStorage (src/utils/storage.js) — nothing here runs
// for them.
//
// Row Level Security in the database guarantees each user can only see and
// change their own rows, even if someone edits this code in their browser.
// ---------------------------------------------------------------------------

import { supabase } from './supabaseClient.js';
import { recordToRow, rowToRecord, HISTORY_COLUMNS } from '../utils/historyMapping.js';
import { MAX_RECORDS } from '../utils/storage.js';
import { NETWORK_MESSAGE } from '../utils/authValidation.js';

const TABLE = 'scan_history';

/** A friendly error. The raw database error is kept in `cause` for debugging only. */
function fail(action, error) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const network = offline || /fetch|network/i.test(String(error?.message || ''));
  const message = network
    ? NETWORK_MESSAGE.replace(' — or continue as a guest', '')
    : `Couldn’t ${action} your account history right now. Please try again.`;
  if (import.meta.env.DEV) console.error(`[JaalBreak] ${action} failed`, error);
  return new Error(message, { cause: error });
}

function requireClient() {
  if (!supabase) throw new Error('Accounts are not configured in this build.');
  return supabase;
}

export async function fetchCloudHistory() {
  const { data, error } = await requireClient()
    .from(TABLE)
    .select(HISTORY_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(MAX_RECORDS);
  if (error) throw fail('load', error);
  return (data || []).map(rowToRecord);
}

export async function insertCloudRecord(record) {
  const { data, error } = await requireClient().from(TABLE).insert(recordToRow(record)).select(HISTORY_COLUMNS).single();
  if (error) throw fail('save to', error);
  return rowToRecord(data);
}

export async function insertCloudRecords(records) {
  if (!records.length) return [];
  const rows = records.slice(0, MAX_RECORDS).map(recordToRow);
  const { data, error } = await requireClient().from(TABLE).insert(rows).select(HISTORY_COLUMNS);
  if (error) throw fail('copy records to', error);
  return (data || []).map(rowToRecord);
}

export async function deleteCloudRecord(id) {
  const { error } = await requireClient().from(TABLE).delete().eq('id', id);
  if (error) throw fail('delete from', error);
}

export async function clearCloudHistory(userId) {
  // A filter is required for deletes; RLS also limits this to the user's own rows.
  const { error } = await requireClient().from(TABLE).delete().eq('user_id', userId);
  if (error) throw fail('clear', error);
}
