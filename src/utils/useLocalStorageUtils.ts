function JSONTryParse<T>(value: string | null, defaultValue: T): T {
  if (value === null) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export default function localStorageUtils<T>(key: string, defaultValue: T) {
  function get(): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return JSONTryParse(stored, defaultValue);
    } catch (err) {
      console.error("Erro ao ler localStorage", err);
      return defaultValue;
    }
  }

  function set(value: T) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Erro ao salvar no localStorage", err);
    }
  }

  return { get, set };
}
