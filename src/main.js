import './style.css'
import { Game } from './Game.js'

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-canvas');
  game.start();

  const fluxValue = document.getElementById('flux-value');
  const fluxRate = document.getElementById('flux-rate');
  const frontlineIndicator = document.getElementById('frontline-indicator');
  const zoneControls = document.getElementById('zone-controls');
  const deckButtons = document.querySelectorAll('.deck-btn');

  let lastZonesHash = '';

  // Update UI loop
  function updateUI() {
    const flux = game.resources.flux;
    fluxValue.textContent = Math.floor(flux);
    fluxRate.textContent = game.resources.incomeRate + game.resources.extractors * 5;

    // Enable/disable deck buttons based on flux
    deckButtons.forEach(btn => {
      const costStr = btn.textContent.match(/\(([^)]+)\)/)[1];
      btn.disabled = flux < parseInt(costStr);
    });

    // Frontline is -50 to 50, map it to 0% to 100%
    const frontlinePercent = ((game.frontlineX + 50) / 100) * 100;
    frontlineIndicator.style.left = `${frontlinePercent}%`;

    // Update Zone buttons only if needed
    const currentZonesHash = game.zones.map(z => `${z.id}:${z.owner}:${z.hasExtractor}`).join('|');
    if (lastZonesHash !== currentZonesHash) {
      lastZonesHash = currentZonesHash;
      zoneControls.innerHTML = '';
      game.zones.forEach(zone => {
        if (zone.owner === 'player' && !zone.hasExtractor) {
          const btn = document.createElement('button');
          btn.className = 'zone-btn';
          btn.textContent = `Build Extractor (Zone ${zone.id})`;
          btn.onclick = () => game.buildExtractor(zone.id);
          zoneControls.appendChild(btn);
        }
      });
    }

    requestAnimationFrame(updateUI);
  }
  updateUI();

  // Deck click handlers
  deckButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      game.spawnUnit('player', btn.dataset.type);
    });
  });

  const hotkeys = {
    '1': 'SCRAP_HOUND',
    '2': 'PEACEKEEPER',
    '3': 'AEGIS_DRONE',
    '4': 'MORTAR_WALKER',
    '5': 'GOLIATH_MECH'
  };

  window.addEventListener('keydown', (e) => {
    if (hotkeys[e.key]) {
      game.spawnUnit('player', hotkeys[e.key]);
    }
  });

  // Hit Marker logic
  const overlay = document.getElementById('ui-overlay');
  window.addEventListener('unit-hit', (e) => {
    if (e.detail.team === 'player') {
      const marker = document.createElement('div');
      marker.className = 'hit-marker';
      overlay.appendChild(marker);

      // Trigger animation
      marker.style.opacity = '1';
      setTimeout(() => {
        marker.style.opacity = '0';
        setTimeout(() => marker.remove(), 200);
      }, 100);
    }
  });

  // Game Over logic
  window.addEventListener('game-over', (e) => {
    const result = e.detail.result;
    const screen = document.createElement('div');
    screen.id = 'game-over-screen';
    screen.innerHTML = `
      <div class="game-over-content">
        <h1>${result}</h1>
        <button id="restart-btn">RE-DEPLOY</button>
      </div>
    `;
    document.body.appendChild(screen);
    document.getElementById('restart-btn').addEventListener('click', () => {
      window.location.reload();
    });
  });
});
