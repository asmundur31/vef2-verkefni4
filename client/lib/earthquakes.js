const currentURL = window.location.href;
const PROXY_SERVER_URL = `${currentURL}proxy`;

export async function fetchEarthquakes(type, period) {
  // TODO sækja gögn frá proxy þjónustu
  const URL = `${PROXY_SERVER_URL}?type=${type}&period=${period}`;
  let result;

  try {
    result = await fetch(URL);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return data;
}
