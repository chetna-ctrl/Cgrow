/**
 * farmStore.js
 * Central data access via Supabase (NO localStorage)
 */

import { supabase } from '../lib/supabaseClient';

// --- DAILY LOGS ---
export const getLogs = async () => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : data;
};

// --- MICROGREENS ---
export const getMicrogreens = async () => {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : data;
};

// --- HYDROPONICS (live sensors) ---
export const getHydroSystems = async () => {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : data;
};

// --- NOTIFY (optional for UI refresh) ---
export const notifyUpdates = () => {
  window.dispatchEvent(new Event('AGRI_OS_UPDATE'));
};
