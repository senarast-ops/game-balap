const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BIKES = [
  { id: 'mio', name: 'Mio Sporty 115', price: 0, baseCC: 113, baseHP: 9.0, bodyStyle: 'compact', defaultColor: '#facc15' },
  { id: 'beat', name: 'Beat Karbu 110', price: 5500000, baseCC: 108, baseHP: 9.3, bodyStyle: 'compact', defaultColor: '#ef4444' },
  { id: 'vario', name: 'Vario 150 LED', price: 14000000, baseCC: 150, baseHP: 13.5, bodyStyle: 'mid', defaultColor: '#f9fafb' },
  { id: 'aerox', name: 'Aerox 155 Connected', price: 23000000, baseCC: 155, baseHP: 15.6, bodyStyle: 'sport', defaultColor: '#2563eb' },
  { id: 'nmax', name: 'NMAX 155', price: 28000000, baseCC: 155, baseHP: 16.2, bodyStyle: 'maxi', defaultColor: '#1f2937' },
  { id: 'xmax', name: 'XMAX 250 Connected', price: 55000000, baseCC: 250, baseHP: 23.0, bodyStyle: 'maxi', defaultColor: '#eab308' }
];

const UPGRADES = {
  cvt: { name: 'Kirian CVT (Roller & Per 1500 RPM)', baseCost: 600000, hpGain: 1.4, ccGain: 0, maxLvl: 5 },
  boreup: { name: 'Paket Bore Up Blok & Piston Forged', baseCost: 1500000, hpGain: 3.5, ccGain: 22, maxLvl: 5 },
  ecu: { name: 'ECU Racing Programmable & Injektor', baseCost: 1200000, hpGain: 2.3, ccGain: 0, maxLvl: 5 },
  exhaust: { name: 'Knalpot Racing Full System', baseCost: 900000, hpGain: 1.8, ccGain: 0, maxLvl: 5 }
};

const TRACKS = [
  { level: 1, city: 'Depok - Trek Juanda Malam', enemyName: 'Mio Kirian Harian', enemyHP: 10.5, prize: 1500000, sky: '#0f172a', accent: '#38bdf8' },
  { level: 2, city: 'Jakarta - Trek Kemayoran', enemyName: 'Beat 130cc Tune Up', enemyHP: 15.5, prize: 3500000, sky: '#1e1b4b', accent: '#f472b6' },
  { level: 3, city: 'Bandung - Sirkuit Brigif', enemyName: 'Vario 180cc Bebasan', enemyHP: 22.0, prize: 7500000, sky: '#172554', accent: '#4ade80' },
  { level: 4, city: 'Yogyakarta - Trek Maguwoharjo', enemyName: 'Aerox 220cc Drag', enemyHP: 30.0, prize: 16000000, sky: '#2e1065', accent: '#facc15' },
  { level: 5, city: 'Surabaya - Gelora Bung Tomo', enemyName: 'XMAX 300cc FFA', enemyHP: 41.0, prize: 35000000, sky: '#3b0764', accent: '#fb923c' }
];

const BODY_COLORS = ['#facc15', '#ef4444', '#2563eb', '#10b981', '#f9fafb', '#1f2937', '#a855f7'];
const RIM_COLORS = ['#fbbf24', '#e5e7eb', '#a855f7', '#ef4444', '#111827'];

let save = JSON.parse(localStorage.getItem('dragMaticIndoSave')) || {
  money: 2500000,
  unlockedLevel: 1,
  currentBike: 'mio',
  ownedBikes: {
    mio: { cvt: 0, boreup: 0, ecu: 0, exhaust: 0, color: '#facc15', rimType: '14', rimColor: '#fbbf24' }
  }
};

function saveGame() {
  localStorage.setItem('dragMaticIndoSave', JSON.stringify(save));
  updateTopBar();
}

function getBikeStats(bikeId) {
  const base = BIKES.find(b => b.id === bikeId);
  const data = save.ownedBikes[bikeId];
  const cc = base.baseCC + data.boreup * UPGRADES.boreup.ccGain;
  const hp = base.baseHP
    + data.cvt * UPGRADES.cvt.hpGain
    + data.boreup * UPGRADES.boreup.hpGain
    + data.ecu * UPGRADES.ecu.hpGain
    + data.exhaust * UPGRADES.exhaust.hpGain
    + (data.rimType === '17' ? 0.6 : 0);
  return { base, data, cc, hp: Number(hp.toFixed(1)) };
}

function formatRp(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function updateTopBar() {
  const stats = getBikeStats(save.currentBike);
  document.getElementById('moneyText').textContent = formatRp(save.money);
  document.getElementById('bikeNameText').textContent = stats.base.name;
  document.getElementById('specText').textContent = `${stats.cc}cc • ${stats.hp} HP`;
}

let currentTab = 'tracks';
function switchTab(tab, btnEl) {
  currentTab = tab;
  if (btnEl) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  renderTab();
}

function renderTab() {
  const container = document.getElementById('tabContent');
  container.innerHTML = '';
  const stats = getBikeStats(save.currentBike);

  if (currentTab === 'tracks') {
    TRACKS.forEach(t => {
      const unlocked = save.unlockedLevel >= t.level;
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div>
          <div class="card-title">Level ${t.level}: ${t.city}</div>
          <div class="card-desc">Lawan: ${t.enemyName} (${t.enemyHP} HP) • Hadiah: ${formatRp(t.prize)}</div>
        </div>
        <button class="btn-action btn-race" ${!unlocked ? 'disabled' : ''} onclick="startRace(${t.level - 1})">
          ${unlocked ? 'BALAP 201M' : 'Terkunci'}
        </button>
      `;
      container.appendChild(div);
    });
  } else if (currentTab === 'upgrade') {
    Object.keys(UPGRADES).forEach(key => {
      const upg = UPGRADES[key];
      const lvl = stats.data[key];
      const cost = Math.round(upg.baseCost * Math.pow(1.65, lvl));
      const isMax = lvl >= upg.maxLvl;
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div>
          <div class="card-title">${upg.name} (Lv.${lvl}/${upg.maxLvl})</div>
          <div class="card-desc">+${upg.hpGain} HP ${upg.ccGain ? '• +' + upg.ccGain + 'cc' : ''}</div>
        </div>
        <button class="btn-action" ${isMax || save.money < cost ? 'disabled' : ''} onclick="buyUpgrade('${key}', ${cost})">
          ${isMax ? 'MENTOK' : formatRp(cost)}
        </button>
      `;
      container.appendChild(div);
    });
  } else if (currentTab === 'visual') {
    const rimCard = document.createElement('div');
    rimCard.className = 'card';
    rimCard.innerHTML = `
      <div>
        <div class="card-title">Gaya Kaki-Kaki & Velg</div>
        <div class="card-desc">Saat ini: Velg ${stats.data.rimType === '17' ? 'Jari-Jari 17 Inci Drag (+0.6 HP)' : 'Racing Cast 14 Inci Standar'}</div>
      </div>
      <button class="btn-action" onclick="toggleRimType()">Ganti 14" / 17"</button>
    `;
    container.appendChild(rimCard);

    const bodyCard = document.createElement('div');
    bodyCard.className = 'card';
    bodyCard.innerHTML = `<div><div class="card-title">Cat Bodi Motor</div><div class="color-row" id="bodySwatches"></div></div>`;
    container.appendChild(bodyCard);
    BODY_COLORS.forEach(c => {
      const s = document.createElement('div');
      s.className = 'swatch';
      s.style.background = c;
      s.onclick = () => { stats.data.color = c; saveGame(); };
      bodyCard.querySelector('#bodySwatches').appendChild(s);
    });

    const wheelCard = document.createElement('div');
    wheelCard.className = 'card';
    wheelCard.innerHTML = `<div><div class="card-title">Warna Velg Anodize / Cat</div><div class="color-row" id="rimSwatches"></div></div>`;
    container.appendChild(wheelCard);
    RIM_COLORS.forEach(c => {
      const s = document.createElement('div');
      s.className = 'swatch';
      s.style.background = c;
      s.onclick = () => { stats.data.rimColor = c; saveGame(); };
      wheelCard.querySelector('#rimSwatches').appendChild(s);
    });
  } else if (currentTab === 'dealer') {
    BIKES.forEach(b => {
      const owned = !!save.ownedBikes[b.id];
      const selected = save.currentBike === b.id;
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div>
          <div class="card-title">${b.name}</div>
          <div class="card-desc">Spek Standar: ${b.baseCC}cc • ${b.baseHP} HP</div>
        </div>
        <button class="btn-action" ${(!owned && save.money < b.price) || selected ? 'disabled' : ''} onclick="selectOrBuyBike('${b.id}')">
          ${selected ? 'Dipakai' : owned ? 'Pakai Motor' : formatRp(b.price)}
        </button>
      `;
      container.appendChild(div);
    });
  }
}

function buyUpgrade(key, cost) {
  const data = save.ownedBikes[save.currentBike];
  if (save.money >= cost && data[key] < UPGRADES[key].maxLvl) {
    save.money -= cost;
    data[key]++;
    saveGame();
    renderTab();
  }
}

function toggleRimType() {
  const data = save.ownedBikes[save.currentBike];
  data.rimType = data.rimType === '14' ? '17' : '14';
  saveGame();
  renderTab();
}

function selectOrBuyBike(id) {
  const bike = BIKES.find(b => b.id === id);
  if (!save.ownedBikes[id]) {
    if (save.money < bike.price) return;
    save.money -= bike.price;
    save.ownedBikes[id] = { cvt: 0, boreup: 0, ecu: 0, exhaust: 0, color: bike.defaultColor, rimType: '14', rimColor: '#fbbf24' };
  }
  save.currentBike = id;
  saveGame();
  renderTab();
}

// Mesin Balap 201M
let mode = 'GARAGE';
let activeTrack = TRACKS[0];
let gasHeld = false;
let rpm = 1500;
let countTimer = 0;
let pDist = 0, pVel = 0, pTime = 0, pFinished = false;
let eDist = 0, eVel = 0, eTime = 0, eFinished = false;
let boostUsed = false, boostTimer = 0, launchBonus = 1;

const btnGas = document.getElementById('btnGas');
const btnBoost = document.getElementById('btnBoost');
const btnBackGarage = document.getElementById('btnBackGarage');
const raceBanner = document.getElementById('raceStatus');

btnGas.addEventListener('mousedown', () => gasHeld = true);
window.addEventListener('mouseup', () => gasHeld = false);
btnGas.addEventListener('touchstart', e => { e.preventDefault(); gasHeld = true; }, { passive: false });
window.addEventListener('touchend', () => gasHeld = false);
window.addEventListener('keydown', e => { if (e.code === 'Space') gasHeld = true; });
window.addEventListener('keyup', e => { if (e.code === 'Space') gasHeld = false; });

btnBoost.addEventListener('click', () => {
  if (mode === 'RACING' && !boostUsed) {
    boostUsed = true;
    boostTimer = 1.4;
    btnBoost.disabled = true;
  }
});

btnBackGarage.addEventListener('click', () => {
  mode = 'GARAGE';
  document.getElementById('garageSection').classList.remove('hidden');
  document.getElementById('raceControls').classList.add('hidden');
  raceBanner.classList.add('hidden');
  renderTab();
});

function startRace(trackIdx) {
  activeTrack = TRACKS[trackIdx];
  mode = 'COUNTDOWN';
  countTimer = 0;
  rpm = 1500;
  pDist = 0; pVel = 0; pTime = 0; pFinished = false;
  eDist = 0; eVel = 0; eTime = 0; eFinished = false;
  boostUsed = false; boostTimer = 0; launchBonus = 1;

  document.getElementById('garageSection').classList.add('hidden');
  document.getElementById('raceControls').classList.remove('hidden');
  btnBackGarage.classList.add('hidden');
  btnBoost.disabled = false;
  raceBanner.classList.remove('hidden');
  raceBanner.textContent = `${activeTrack.city} • Tahan Gas di Zona Hijau!`;
}

function drawScooter(x, y, scale, color, rimType, rimColor, bodyStyle, isRacing, flame) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const rRadius = rimType === '17' ? 24 : 19;
  const rThickness = rimType === '17' ? 3 : 6;

  // Ban Belakang & Depan
  [-46, 48].forEach(wx => {
    ctx.beginPath();
    ctx.arc(wx, 0, rRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = rThickness + 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(wx, 0, rRadius - 3, 0, Math.PI * 2);
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let i = 0; i < (rimType === '17' ? 8 : 5); i++) {
      const ang = (Math.PI * 2 * i) / (rimType === '17' ? 8 : 5) + (pDist * 0.4);
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.lineTo(wx + Math.cos(ang) * (rRadius - 3), Math.sin(ang) * (rRadius - 3));
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = rimType === '17' ? 1 : 2.5;
      ctx.stroke();
    }
  });

  // CVT & Knalpot Racing
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(-52, -8, 34, 12);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-25, 2);
  ctx.lineTo(-64, -14);
  ctx.stroke();

  if (flame) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-64, -14);
    ctx.lineTo(-92 - Math.random() * 15, -19);
    ctx.lineTo(-64, -9);
    ctx.fill();
  }

  // Bodi Matic
  ctx.fillStyle = color;
  ctx.beginPath();
  if (bodyStyle === 'maxi') {
    ctx.moveTo(-55, -18);
    ctx.lineTo(-10, -34);
    ctx.lineTo(18, -16);
    ctx.lineTo(36, -46);
    ctx.lineTo(52, -22);
    ctx.lineTo(25, -4);
    ctx.lineTo(-42, -6);
  } else {
    ctx.moveTo(-50, -20);
    ctx.lineTo(-12, -30);
    ctx.lineTo(12, -10);
    ctx.lineTo(34, -44);
    ctx.lineTo(46, -20);
    ctx.lineTo(22, -4);
    ctx.lineTo(-40, -6);
  }
  ctx.closePath();
  ctx.fill();

  // Jok & Stang
  ctx.fillStyle = '#111827';
  ctx.fillRect(-44, -35, 36, 7);
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(32, -42);
  ctx.lineTo(25, -54);
  ctx.stroke();

  if (bodyStyle === 'maxi') {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.beginPath();
    ctx.moveTo(36, -44);
    ctx.lineTo(28, -62);
    ctx.lineTo(42, -46);
    ctx.fill();
  }

  // Joki Nunduk saat Balap
  if (isRacing) {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-10, -46, 22, 9, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(14, -52, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

let lastTS = performance.now();
function gameLoop(ts) {
  const dt = Math.min((ts - lastTS) / 1000, 0.05);
  lastTS = ts;

  const stats = getBikeStats(save.currentBike);

  if (mode === 'GARAGE') {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 800, 340);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 260, 800, 80);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('GARASI MODIF & DYNO', 26, 46);

    drawScooter(400, 240, 1.85, stats.data.color, stats.data.rimType, stats.data.rimColor, stats.base.bodyStyle, false, false);
  } else {
    // Update Fisika Balap
    if (gasHeld) rpm = Math.min(10500, rpm + 9500 * dt);
    else rpm = Math.max(1500, rpm - 7500 * dt);

    if (mode === 'COUNTDOWN') {
      countTimer += dt;
      if (countTimer >= 3.0) {
        mode = 'RACING';
        if (rpm >= 7200 && rpm <= 9200) {
          launchBonus = 1.16;
          raceBanner.textContent = '🚀 PERFECT LAUNCH! GAS POL!';
        } else if (rpm > 9200) {
          launchBonus = 0.92;
          raceBanner.textContent = '⚠️ OVER-REV SPIN!';
        } else {
          launchBonus = 0.96;
          raceBanner.textContent = '💨 KURANG RPM START!';
        }
      }
    } else if (mode === 'RACING') {
      if (!pFinished) {
        pTime += dt;
        if (boostTimer > 0) boostTimer -= dt;
        const throttle = gasHeld ? 1.0 : 0.2;
        const boostMult = boostTimer > 0 ? 1.28 : 1.0;
        const accel = (stats.hp * 1.45 * launchBonus * boostMult * throttle) - (pVel * 0.34);
        pVel = Math.max(0, pVel + accel * dt);
        pDist += pVel * dt;
        if (pDist >= 201) { pDist = 201; pFinished = true; }
      }
      if (!eFinished) {
        eTime += dt;
        const eAccel = (activeTrack.enemyHP * 1.44) - (eVel * 0.34);
        eVel = Math.max(0, eVel + eAccel * dt);
        eDist += eVel * dt;
        if (eDist >= 201) { eDist = 201; eFinished = true; }
      }
      if (pFinished && eFinished) {
        mode = 'FINISHED';
        const win = pTime <= eTime;
        const reward = win ? activeTrack.prize : Math.round(activeTrack.prize * 0.2);
        save.money += reward;
        if (win && save.unlockedLevel === activeTrack.level && save.unlockedLevel < TRACKS.length) {
          save.unlockedLevel++;
        }
        saveGame();
        raceBanner.textContent = win
          ? `🏆 MENANG! ${pTime.toFixed(2)} dtk vs ${eTime.toFixed(2)} dtk (+${formatRp(reward)})`
          : `❌ KALAH! ${pTime.toFixed(2)} dtk vs ${eTime.toFixed(2)} dtk (+${formatRp(reward)})`;
        btnBackGarage.classList.remove('hidden');
      }
    }

    // Gambar Trek Kota
    ctx.fillStyle = activeTrack.sky;
    ctx.fillRect(0, 0, 800, 175);

    // Gedung Siluet Kota Bergerak
    ctx.fillStyle = '#090d16';
    const scrollX = (pDist * 18) % 160;
    for (let i = -1; i < 7; i++) {
      const bx = i * 160 - scrollX;
      ctx.fillRect(bx, 95, 70, 80);
      ctx.fillRect(bx + 80, 115, 65, 60);
    }

    // Aspal 2 Jalur
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 175, 800, 165);
    ctx.strokeStyle = '#facc15';
    ctx.setLineDash([28, 22]);
    ctx.lineDashOffset = -(pDist * 40);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 252);
    ctx.lineTo(800, 252);
    ctx.stroke();
    ctx.setLineDash([]);

    // Garis Finis 201M
    const finishScreenX = 160 + (201 - pDist) * 25;
    if (finishScreenX > -40 && finishScreenX < 840) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(finishScreenX, 175, 16, 165);
    }

    // Motor Lawan & Motor Pemain
    const enemyScreenX = 160 + (eDist - pDist) * 25;
    drawScooter(enemyScreenX, 225, 0.9, activeTrack.accent, '17', '#e5e7eb', 'sport', true, false);
    drawScooter(160, 305, 1.0, stats.data.color, stats.data.rimType, stats.data.rimColor, stats.base.bodyStyle, true, boostTimer > 0);

    // Lampu Start Drag (Christmas Tree)
    if (mode === 'COUNTDOWN' || pDist < 12) {
      ctx.fillStyle = '#111827';
      ctx.fillRect(365, 48, 70, 115);
      for (let l = 0; l < 3; l++) {
        ctx.fillStyle = countTimer > (l + 1) * 0.75 ? '#facc15' : '#374151';
        ctx.beginPath(); ctx.arc(400, 68 + l * 26, 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = mode === 'RACING' ? '#22c55e' : '#374151';
      ctx.beginPath(); ctx.arc(400, 146, 10, 0, Math.PI * 2); ctx.fill();
    }

    // Bar RPM & Speedometer
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(16, 16, 220, 54);
    ctx.fillStyle = '#374151';
    ctx.fillRect(26, 46, 200, 12);
    ctx.fillStyle = 'rgba(34,197,94,0.45)';
    ctx.fillRect(26 + (7200 / 10500) * 200, 46, ((9200 - 7200) / 10500) * 200, 12);
    ctx.fillStyle = rpm > 9200 ? '#ef4444' : rpm >= 7200 ? '#22c55e' : '#facc15';
    ctx.fillRect(26, 46, (rpm / 10500) * 200, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    const kmh = Math.round(pVel * 3.6);
    ctx.fillText(`RPM: ${Math.round(rpm)} | ${kmh} km/j | ${Math.floor(pDist)}m`, 26, 36);
  }

  requestAnimationFrame(gameLoop);
}

updateTopBar();
renderTab();
requestAnimationFrame(gameLoop);