/**
 * Storage utility — thin AsyncStorage wrapper.
 * All trip data is persisted under a single versioned key.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIP_KEY = 'nomadwise_trip_v1';

export async function saveTrip(payload) {
  try {
    await AsyncStorage.setItem(TRIP_KEY, JSON.stringify(payload));
  } catch (_) {}
}

export async function loadTrip() {
  try {
    const raw = await AsyncStorage.getItem(TRIP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function clearTrip() {
  try {
    await AsyncStorage.removeItem(TRIP_KEY);
  } catch (_) {}
}
