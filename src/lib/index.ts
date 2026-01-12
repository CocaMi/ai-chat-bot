/**
 * Utility library exports
 */

// Add utility functions and helpers here
export const LIB_VERSION = '1.0.0';

// Example utility function
export function createLogger(prefix: string) {
  return {
    log: (...args: any[]) => console.log(`[${prefix}]`, ...args),
    error: (...args: any[]) => console.error(`[${prefix}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${prefix}]`, ...args),
  };
}

// Export store
export { useChatStore } from './store';
