type RateLimitStore = Map<string, { count: number; resetAt: number }>;

const store: RateLimitStore = new Map();

export type RateLimitConfig = {
  interval: number;
  limit: number;
};

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, limit: 30 }
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const key = identifier;

  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.interval,
    });

    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + config.interval,
    };
  }

  if (current.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: current.resetAt,
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    success: true,
    remaining: config.limit - current.count,
    reset: current.resetAt,
  };
}

export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entries = Array.from(store.entries());
  for (const [key, value] of entries) {
    if (value.resetAt < now) {
      store.delete(key);
    }
  }
}

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(cleanupRateLimitStore, 60000);
}
