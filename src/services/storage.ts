/** Local storage service */
export function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function setJSON(key: string, value: unknown) {
  uni.setStorageSync(key, JSON.stringify(value))
}

