// Simple console-based logger to avoid Pino thread issues
export function logInfo(message: string, meta?: Record<string, any>) {
  console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
}

export function logError(message: string, error?: Error | unknown, meta?: Record<string, any>) {
  console.error(`[ERROR] ${message}`, error, meta ? JSON.stringify(meta) : '');
}

export function logWarn(message: string, meta?: Record<string, any>) {
  console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
}

export function logDebug(message: string, meta?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
  }
}
