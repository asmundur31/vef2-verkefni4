import redis from 'redis';
import util from 'util';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const {
  REDIS_URL: redisUrl,
} = process.env;

let client;
let asyncGet;
let asyncSet;
if (redisUrl) {
  client = redis.createClient({ url: redisUrl });
  asyncGet = util.promisify(client.get).bind(client);
  asyncSet = util.promisify(client.set).bind(client);
}

/**
 * Returns cached data or null if not cached.
 * @param {string} cacheKey Cache key to for data for
 * @returns {object} Data as the cached object, otherwise null
 */
async function get(cacheKey) {
  // Slökkt á cache
  if (!client || !asyncGet) {
    return null;
  }

  let cached;

  try {
    cached = await asyncGet(cacheKey);
  } catch (e) {
    console.warn(`unable to get from cache, ${cacheKey}, ${e.message}`);
    return null;
  }

  if (!cached) {
    return null;
  }

  let result;

  try {
    result = JSON.parse(cached);
  } catch (e) {
    console.warn(`unable to parse cached data, ${cacheKey}, ${e.message}`);
    return null;
  }

  return result;
}

/**
 * Cache data for a specific time under a cacheKey.
 *
 * @param {string} cacheKey Cache key to cache data under
 * @param {object} data Data to cache
 * @param {number} ttl Time-to-live of cache
 * @returns {Promise<boolean>} true if data cached, otherwise false
 */
async function set(cacheKey, data, ttl) {
  if (!client || !asyncSet) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    await asyncSet(cacheKey, serialized, 'EX', ttl);
  } catch (e) {
    console.warn('unable to set cache for ', cacheKey);
    return false;
  }

  return true;
}

export async function cachedEarthquakes(url) {
  // Reynum að ná í gögnin í cache
  const dataCached = await get(url);
  if (dataCached) {
    // Ef við finnum gögnin þá skilum við þeim
    const data = dataCached;
    const cached = true;
    return { data, cached };
  }
  // annars sækjum við gögnin
  const response = await fetch(url);
  const json = await response.json();
  const data = json;
  const cached = false;
  // Vistum þetta í cache
  await set(url, data, 600);
  return { data, cached };
}
