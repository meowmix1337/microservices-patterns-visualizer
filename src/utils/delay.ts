/**
 * Utility function to create a promise that resolves after a specified delay
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))
