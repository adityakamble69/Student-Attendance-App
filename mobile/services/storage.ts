// services/storage.ts — secure token storage (rules.md: never plain AsyncStorage for tokens).
import EncryptedStorage from 'react-native-encrypted-storage';

export async function setToken(key: string, value: string) {
  await EncryptedStorage.setItem(key, value);
}

export async function getToken(key: string): Promise<string | null> {
  return EncryptedStorage.getItem(key);
}

export async function clearToken(key: string) {
  await EncryptedStorage.removeItem(key);
}
