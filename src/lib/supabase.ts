import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kxdlhtyqoimlosjlggqc.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZGxodHlxb2ltbG9zamxnZ3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTMwMzgsImV4cCI6MjA4NTYyOTAzOH0.AtWEhwmPMmaXZoA8ueoON6xDJmUAU_NQISD-3UCA6oI';

// Create Supabase client with AsyncStorage for persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 60, // Support 60fps drawing
    },
  },
});

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return SUPABASE_URL.includes('supabase.co') && 
         SUPABASE_ANON_KEY.length > 50;
};

// Generate a random room code (6 characters)
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a unique player ID
export const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default supabase;
