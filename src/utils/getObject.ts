import { JSONFileSync } from './JSONFileSync';

export function getObject<T>(str?: string, path?: string): T | undefined {
  if (str) {
    try {
      return JSON.parse(str) as T;
    } catch (error) {
      throw new Error(`Cannot parse string as JSON`);
    }
  } else if (path) {
    try {
      const reader = new JSONFileSync(path);
      return JSON.parse(reader.read()) as T;
    } catch (error) {
      throw new Error(`Cannot read file as JSON`);
    }
  }
}
