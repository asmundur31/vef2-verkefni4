import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup, clearMarkers } from './lib/map';

/**
 * Fall sem birtir alla jarðskjálfta
 * @param {json} earthquakes json sem inniheldur alla jarðskjálfta sem á að birta
 */
function showEarthquakes(earthquakes, titleE, elapsed, cached) {
  const ul = document.querySelector('.earthquakes');
  if (!earthquakes) {
    ul.parentNode.appendChild(
      el('p', 'Villa við að sækja gögn'),
    );
  }
  const header = document.querySelector('.chosen_earthquakes');
  header.innerHTML = titleE;
  const cache = document.querySelector('.cache');
  if (cached) {
    cache.innerHTML = `Gögn eru í cache. Fyrirspurn tók ${elapsed} sek.`;
  } else {
    cache.innerHTML = `Gögn eru ekki í cache. Fyrirspurn tók ${elapsed} sek.`;
  }
  // Birtum síðan alla jarðskjálftana
  earthquakes.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
}

/**
 * Fall sem hreinsar burt alla jarðskjálfta sem eru núverandi á síðunni
 */
function clearEarthquakes() {
  const ul = document.querySelector('.earthquakes');
  const cache = document.querySelector('.cache');
  const header = document.querySelector('.chosen_earthquakes');
  ul.innerHTML = '';
  cache.innerHTML = '';
  header.innerHTML = '';
  clearMarkers();
}

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      // Byrjum á að hreinsa jarðskjálfta ef eitthverjir eru
      clearEarthquakes();

      const urlParams = new URLSearchParams(e.target.getAttribute('href').slice(2));
      const type = urlParams.get('type');
      const period = urlParams.get('period');

      // Birtum loading gaurinn
      const loading = document.querySelector('.loading');
      loading.classList.toggle('hidden');
      // Sækjum svo gögnin
      const earthquakes = await fetchEarthquakes(type, period);

      // Fjarlægjum loading gaurinn
      loading.classList.toggle('hidden');
      // Birtum jarðskjálftana
      showEarthquakes(
        earthquakes.data.features,
        earthquakes.data.metadata.title,
        earthquakes.info.elapsed,
        earthquakes.info.cached,
      );
    });
  });
  const map = document.querySelector('.map');
  init(map);
});
