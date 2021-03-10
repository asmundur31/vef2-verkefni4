import express from 'express';
import { timerStart, timerEnd } from './time.js';
import { cachedEarthquakes } from './cache.js';

// TODO útfæra proxy virkni
export const router = express.Router();

const API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

router.get('/', async (req, res) => {
  const { type, period } = req.query;
  const url = `${API_URL + type}_${period}.geojson`;
  // Byrjum tímatöku
  const timer = timerStart();
  const response = await cachedEarthquakes(url);
  // Stoppum tímatöku
  const elapsed = timerEnd(timer);
  const { data, cached } = response;

  const info = {
    cached,
    elapsed,
  };
  const earthquakes = {
    data,
    info,
  };

  res.json(earthquakes);
});
