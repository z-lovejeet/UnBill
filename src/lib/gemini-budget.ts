import { redisClient } from './api-utils';

export const GEMINI_PRIMARY_DAILY_LIMIT = 18;
const reserveScript = `local n=tonumber(redis.call('GET',KEYS[1]) or '0');if n>=tonumber(ARGV[1]) then return 0 end;n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[2]) end;return 1`;
const localAttempts = new Map<string, number>();
const quotaDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
function budgetKey(model: string) {
  // A stable scope survives key rotation and is shared by all deployment instances.
  const scope = process.env.GEMINI_QUOTA_SCOPE || 'unbill';
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(scope)) return null;
  return `unbill:gemini-primary:${scope}:${quotaDay.format(new Date(Date.now()))}:${model}`;
}

export async function reserveGeminiPrimaryAttempt(model: string): Promise<boolean> {
  const key = budgetKey(model);
  if (!key || (localAttempts.get(key) || 0) >= GEMINI_PRIMARY_DAILY_LIMIT) return false;
  const redis = redisClient();
  if (redis) {
    try {
      // Redis reserves before the provider call, atomically across concurrent workers.
      // Keys change at Pacific midnight; the longer TTL only cleans up older days.
      return (
        Number(await redis.eval(reserveScript, [key], [GEMINI_PRIMARY_DAILY_LIMIT, 172800])) === 1
      );
    } catch {
      console.warn('[unbill:extraction]', { code: 'PRIMARY_BUDGET_UNAVAILABLE' });
      return false;
    }
  }
  // Public deployments never spend primary quota without the shared ledger.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_RATE_LIMIT !== 'true')
    return false;
  const count = localAttempts.get(key) || 0;
  if (count >= GEMINI_PRIMARY_DAILY_LIMIT) return false;
  localAttempts.set(key, count + 1);
  return true;
}

export async function exhaustGeminiPrimaryBudget(model: string): Promise<void> {
  const key = budgetKey(model);
  if (!key) return;
  localAttempts.set(key, GEMINI_PRIMARY_DAILY_LIMIT);
  const redis = redisClient();
  if (!redis) return;
  try {
    await redis.eval(
      "local n=tonumber(redis.call('GET',KEYS[1]) or '0');if n<tonumber(ARGV[1]) then redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[2]) end;return 1",
      [key],
      [GEMINI_PRIMARY_DAILY_LIMIT, 172800],
    );
  } catch {
    console.warn('[unbill:extraction]', { code: 'PRIMARY_QUOTA_BLOCK_NOT_SHARED' });
  }
}
