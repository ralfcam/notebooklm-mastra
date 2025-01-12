import { useState, useEffect, useCallback } from "react";

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * Custom hook for managing state in sessionStorage
 * @param key The key to store the value under in sessionStorage
 * @param initialValue The initial value to use if no value exists in storage
 * @returns A tuple containing the current value and a setter function
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, SetValue<T>] {
  // Get from storage or use initial value
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === "undefined") {
        console.warn(
          `Tried setting sessionStorage key "${key}" even though environment is not a client`,
        );
      }

      try {
        // Allow value to be a function so we have same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to sessionStorage
        window.sessionStorage.setItem(key, JSON.stringify(newValue));

        // Save state
        setStoredValue(newValue);

        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event("session-storage"));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle storage changes in other windows/tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // Listen for storage changes
    window.addEventListener("session-storage", handleStorageChange);

    return () => {
      window.removeEventListener("session-storage", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue];
}
