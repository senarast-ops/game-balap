const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BIKES = [
  { id: 'mio', name: 'Mio Sporty 115', price: 0, baseCC: 113, baseHP: 9.0, shape: 'mio', defaultColor: '#facc15' },
  { id: 'fino', name: 'Fino 115 Classic', price: 4800000, baseCC: 115, baseHP: 9.4, shape: 'fino', defaultColor: '#f8fafc' },
  { id: 'beat', name: 'Beat Karbu 110', price: 6500000, baseCC: 108, baseHP: 9.6, shape: 'beat', defaultColor: '#ef4444' },
  { id: 'vario', name: 'Vario 150 LED', price: 15000000, baseCC: 150, baseHP: 13.8, shape: 'vario', defaultColor: '#dc2626' },
  { id: 'aerox', name: 'Aerox 155 Connected', price: 24500000, baseCC: 155, baseHP: 15.8, shape: 'aerox', defaultColor: '#2563eb' },
  { id: 'nmax', name: 'NMAX 155 Old', price: 29000000, baseCC: 155, baseHP: 16.4, shape: 'nmax', defaultColor: '#1e293b' },
  { id: 'xmax', name: 'XMAX 250 Connected', price: 58000000, baseCC: 250, baseHP: 23.5, shape: 'xmax', defaultColor: '#eab308' }
];

const UPGRADES = {
  cvt: { name: 'Kirian CVT Full Spek (Roller, Per 1500 RPM, Mangkok Kartel)', baseCost: 650000, hpGain: 1.5, ccGain: 0, maxLvl: 5 },
  boreup: { name: 'Paket Bore Up Forged Piston + Noken As Racing', baseCost: 1600000, hpGain: 3.8, ccGain: 22, maxLvl: 5 },
  ecu: { name: 'ECU Racing Programmable + Injektor Racing', baseCost: 1300000, hpGain: 2.5, ccGain: 0, maxLvl: 5 },
  exhaust: { name: 'Knalpot Racing Titanium Blue-Burn Full System', baseCost: 950000, hpGain: 2.0, ccGain: 0, maxLvl: 5 }
};

const TRACKS = [
  { level: 1, city: 'Depok - Jl. Ir. H. Juanda (Malam)', landmark: 'depok', enemyName: 'Mio 130cc Harian', enemyShape: 'mio', enemyHP: 10.6, prize: 1600000, skyTop: '#070b14', skyBot: '#1e293b', lightColor: '#fde047' },
  { level: 2, city: 'Jakarta - Trek Lurus Kemayoran', landmark: 'jakarta', enemyName: 'Beat 130cc Tune Up', enemyShape: 'beat', enemyHP: 15.8, prize: 3800000, skyTop: '#0f172a', skyBot: '#312e81', lightColor: '#38bdf8' },
  { level: 3, city: 'Bandung - Sirkuit Brigif / Pasupati', landmark: 'bandung', enemyName: 'Fino 155cc Selembaran', enemyShape: 'fino', enemyHP: 21.5, prize: 7500000, skyTop: '#172554', skyBot: '#1e3a8a', lightColor: '#f8fafc' },
  { level: 4, city: 'Semarang - Trek Simpang Lima', landmark: 'semarang', enemyName: 'Vario 180cc Bebasan', enemyShape: 'vario', enemyHP: 27.5, prize: 13500000, skyTop: '#1e1b4b', skyBot: '#4c1d95', lightColor: '#fb7185' },
  { level: 5, city: 'Yogyakarta - Trek Maguwoharjo', landmark: 'jogja', enemyName: 'Aerox 200cc Risetan', enemyShape: 'aerox', enemyHP: 34.0, prize: 22000000, skyTop: '#27171a', skyBot: '#7c2d12', lightColor: '#fbbf24' },
  { level: 6, city: 'Surabaya - Gelora Bung Tomo', landmark: 'surabaya', enemyName: 'NMAX 230cc Touring Jahat', enemyShape: 'nmax', enemyHP: 41.5, prize: 36000000, skyTop: '#042f2e', skyBot: '#115e59', lightColor: '#2dd4bf' },
  { level: 7, city: 'Bogor - Sirkuit Internasional Sentul', landmark: 'sentul', enemyName: 'XMAX 300cc FFA Nasional', enemyShape: 'xmax', enemyHP: 50.0, prize: 60000000, skyTop: '#0c4a6e', skyBot: '#38bdf8', lightColor: '#ffffff' }
];

const BODY_COLORS = ['#facc15', '#ef4444', '#2563eb', '#10b981', '#f8fafc', '#1e293b', '#a855f7', '#f97316'];
const RIM_COLORS = ['#fbbf24', '#e2e8f0', '#a855f7', '#ef4444', '#38bdf8', '#111827'];
const SHOCK_COLORS = ['#ef4444', '#facc15', '#e2e8f0', '#a855f7'];
const CALIPER_COLORS = ['#eab308', '#ef4444', '#94a3b8', '#2563eb'];

const defaultBikeConfig = (color) => ({
  cvt: 0, boreup: 0, ecu: 0, exhaust: 0,
  color: color, rimType: '14', rimColor: '#fbbf24',
  shockColor: '#ef4444', caliperColor: '#eab308', seatSlim: false
});

let save = JSON.parse(localStorage.getItem('dragMaticIndoSaveV2')) || {
  money: 2500000,
  unlockedLevel: 1,
  currentBike: 'mio',
  ownedBikes: { mio: defaultBikeConfig('#facc15') }
};

// Pastikan kompatibilitas data motor
Object.keys(save.ownedBikes).forEach(k => {
  save.ownedBikes[k] = { ...defaultBikeConfig('#facc15'), ...save.ownedBikes[k] };
});

function saveGame() {
  localStorage.setItem('dragMaticIndoSaveV2', JSON.stringify(save));
  updateTopBar();
}

function getBikeStats(bikeId) {
  const base = BIKES.find(b => b.id === bikeId) || BIKES[0];
  const data = save.ownedBikes[bikeId];
  const cc = base.baseCC + data.boreup * UPGRADES.boreup.ccGain;
  const hp = base.baseHP
    + data.cvt * UPGRADES.cvt.hpGain
    + data.boreup * UPGRADES.boreup.hpGain
    + data.ecu * UPGRADES.ecu.hpGain
    + data.exhaust * UPGRADES.exhaust.hpGain
    + (data.rimType === '17' ? 0.7 : 0)
    + (data.seatSlim ? 0.4 : 0);
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
          <div class="card-title">Lv.${t.level} — ${t.city}</div>
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
          <div class="card-desc">+${upg.hpGain} HP ${upg.ccGain ? '• +' + upg.ccGain + 'cc' : ''} ${key === 'exhaust' && lvl === 0 ? '• Buka Leheran Titanium Pelangi' : ''}</div>
        </div>
        <button class="btn-action" ${isMax || save.money < cost ? 'disabled' : ''} onclick="buyUpgrade('${key}', ${cost})">
          ${isMax ? 'MENTOK' : formatRp(cost)}
        </button>
      `;
      container.appendChild(div);
    });
  } else if (currentTab === 'visual') {
    // Velg 14 vs 17
    const rimCard = document.createElement('div');
    rimCard.className = 'card';
    rimCard.innerHTML = `
      <div>
        <div class="card-title">Setup Kaki-Kaki & Velg</div>
        <div class="card-desc">${stats.data.rimType === '17' ? 'Velg Jari-Jari Alumunium 17" Ban Cacing (+0.7 HP)' : 'Velg Racing Cast Wheel 14" Ban Donat'}</div>
      </div>
      <button class="btn-action" onclick="togglePart('rimType')">Ubah 14" / 17"</button>
    `;
    container.appendChild(rimCard);

    // Jok Papas vs Standar
    const seatCard = document.createElement('div');
    seatCard.className = 'card';
    seatCard.innerHTML = `
      <div>
        <div class="card-title">Model Jok Motor</div>
        <div class="card-desc">${stats.data.seatSlim ? 'Jok Papas Tipis Drag Style (+0.4 HP)' : 'Jok Tebal Harian / Touring'}</div>
      </div>
      <button class="btn-action" onclick="togglePart('seatSlim')">Ganti Jok</button>
    `;
    container.appendChild(seatCard);

    // Pemilih warna part
    const addSwatchCard = (title, colors, prop) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<div><div class="card-title">${title}</div><div class="color-row"></div></div>`;
      const row = card.querySelector('.color-row');
      colors.forEach(c => {
        const s = document.createElement('div');
        s.className = 'swatch';
        s.style.background = c;
        if (stats.data[prop] === c) s.style.outline = '3px solid #facc15';
        s.onclick = () => { stats.data[prop] = c; saveGame(); renderTab(); };
        row.appendChild(s);
      });
      container.appendChild(card);
    };

    addSwatchCard('Warna Bodi Utama', BODY_COLORS, 'color');
    addSwatchCard('Warna Velg Anodize', RIM_COLORS, 'rimColor');
    addSwatchCard('Ulir Shockbreaker Tabung (KTC/Ohlins Style)', SHOCK_COLORS, 'shockColor');
    addSwatchCard('Kaliper Rem Cakram (Nissin/Brembo Style)', CALIPER_COLORS, 'caliperColor');

  } else if (currentTab === 'dealer') {
    BIKES.forEach(b => {
      const owned = !!save.ownedBikes[b.id];
      const selected = save.currentBike === b.id;
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div>
          <div class="card-title">${b.name}</div>
          <div class="card-desc">Mesin Standar: ${b.baseCC}cc • ${b.baseHP} HP</div>
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

function togglePart(type) {
  const data = save.ownedBikes[save.currentBike];
  if (type === 'rimType') data.rimType = data.rimType === '14' ? '17' : '14';
  if (type === 'seatSlim') data.seatSlim = !data.seatSlim;
  saveGame();
  renderTab();
}

function selectOrBuyBike(id) {
  const bike = BIKES.find(b => b.id === id);
  if (!save.ownedBikes[id]) {
    if (save.money < bike.price) return;
    save.money -= bike.price;
    save.ownedBikes[id] = defaultBikeConfig(bike.defaultColor);
  }
  save.currentBike = id;
  saveGame();
  renderTab();
}

// ================== VISUAL DETAIL MOTOR & PART ==================
function drawDetailedScooter(x, y, scale, cfg, shape, wheelSpin, isRacing, flame, wheelieDeg = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (wheelieDeg !== 0) {
    ctx.translate(-48, 0);
    ctx.rotate(wheelieDeg);
    ctx.translate(48, 0);
  }

  const is17 = cfg.rimType === '17';
  const rOuter = is17 ? 25 : 20;
  const tireWidth = is17 ? 3.5 : 6.5;
  const wheelPositions = [-48, 50];

  // 1. Roda, Velg, Cakram & Kaliper
  wheelPositions.forEach((wx, idx) => {
    // Ban Karet + Alur
    ctx.beginPath();
    ctx.arc(wx, 0, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = tireWidth;
    ctx.stroke();

    // Bibir Velg Anodize
    const rimRad = rOuter - tireWidth / 2 - 1.5;
    ctx.beginPath();
    ctx.arc(wx, 0, rimRad, 0, Math.PI * 2);
    ctx.strokeStyle = cfg.rimColor;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Jari-jari 17" Rapat vs Palang Racing 14"
    const spokes = is17 ? 16 : 5;
    for (let i = 0; i < spokes; i++) {
      const ang = (Math.PI * 2 * i) / spokes + wheelSpin;
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.lineTo(wx + Math.cos(ang) * rimRad, Math.sin(ang) * rimRad);
      ctx.strokeStyle = is17 ? '#e2e8f0' : cfg.rimColor;
      ctx.lineWidth = is17 ? 0.9 : 3.2;
      ctx.stroke();
    }

    // Piringan Cakram Depan (dan Belakang untuk XMAX/NMAX)
    if (idx === 1 || shape === 'xmax' || shape === 'nmax') {
      ctx.beginPath();
      ctx.arc(wx, 0, 11, 0, Math.PI * 2);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(wx, 0, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#f97316'; // Floating pin tengah cakram
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Tromol Tengah
    ctx.beginPath();
    ctx.arc(wx, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
  });

  // 2. Shockbreaker Belakang Tabung (Sub-tank)
  ctx.strokeStyle = cfg.shockColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-45, -6);
  ctx.lineTo(-34, -27);
  ctx.stroke();
  // Tabung emas shock
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-33, -27, 5, 9);

  // 3. Bak CVT Detail + Baut Probolt Ungu
  ctx.fillStyle = cfg.cvt > 0 ? '#475569' : '#64748b';
  ctx.beginPath();
  ctx.roundRect(-53, -8, 36, 13, 6);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Tutup Kipas / Pulley CVT
  ctx.beginPath();
  ctx.arc(-45, -1.5, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = cfg.cvt >= 2 ? '#ef4444' : '#1e293b';
  ctx.fill();
  // Baut Titanium Ungu
  [-50, -40, -30, -21].forEach(bx => {
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(bx, -7, 1.8, 1.8);
  });

  // 4. Blok Mesin & Knalpot Racing (Standar vs Titanium Pelangi)
  if (cfg.exhaust > 0) {
    const grad = ctx.createLinearGradient(-20, 4, -68, -16);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(0.45, '#a855f7');
    grad.addColorStop(0.8, '#38bdf8');
    grad.addColorStop(1, '#cbd5e1');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-16, 4);
    ctx.quadraticCurveTo(-30, 10, -45, -6);
    ctx.lineTo(-55, -11);
    ctx.stroke();

    // Silencer Racing + Endcap Carbon
    ctx.save();
    ctx.translate(-58, -13);
    ctx.rotate(-0.26);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-16, -3.5, 22, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-19, -3.5, 4, 7);
    ctx.restore();
  } else {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-20, 3);
    ctx.lineTo(-64, -10);
    ctx.stroke();
  }

  // Semburan Api Backfire / Power Jet
  if (flame) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-74, -17);
    ctx.lineTo(-104 - Math.random() * 18, -23);
    ctx.lineTo(-74, -12);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-74, -16);
    ctx.lineTo(-90 - Math.random() * 8, -19);
    ctx.lineTo(-74, -13);
    ctx.fill();
  }

  // 5. Garpu Teleskopik Depan & Kaliper Rem
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(34, -38);
  ctx.lineTo(50, 0);
  ctx.stroke();
  // Kaliper Nissin / Brembo
  ctx.fillStyle = cfg.caliperColor;
  ctx.fillRect(42, -9, 6.5, 8);

  // 6. Siluet Bodi Spesifik Tiap Tipe Motor Matic
  ctx.fillStyle = cfg.color;
  ctx.beginPath();
  if (shape === 'xmax' || shape === 'nmax') {
    // Maxi Gambot (Dek punggung tengah tinggi + tebeng lebar)
    ctx.moveTo(-58, -22);
    ctx.lineTo(-16, -34);
    ctx.lineTo(14, -22); // Punuk tangki tengah khas Maxi
    ctx.lineTo(35, -48);
    ctx.lineTo(55, -24);
    ctx.lineTo(30, -5);
    ctx.lineTo(-38, -6);
  } else if (shape === 'aerox') {
    // Sport Matic Tajam Nungging
    ctx.moveTo(-58, -32);
    ctx.lineTo(-14, -32);
    ctx.lineTo(12, -18);
    ctx.lineTo(36, -46);
    ctx.lineTo(52, -23);
    ctx.lineTo(26, -6);
    ctx.lineTo(-32, -8);
  } else if (shape === 'fino') {
    // Retro Membulat
    ctx.moveTo(-52, -18);
    ctx.quadraticCurveTo(-34, -34, -12, -28);
    ctx.lineTo(14, -9);
    ctx.lineTo(31, -43);
    ctx.quadraticCurveTo(47, -33, 44, -18);
    ctx.lineTo(22, -5);
    ctx.lineTo(-40, -6);
  } else if (shape === 'vario' || shape === 'beat') {
    // Dek Rata Sudut Tajam Honda
    ctx.moveTo(-54, -26);
    ctx.lineTo(-14, -30);
    ctx.lineTo(12, -10);
    ctx.lineTo(35, -45);
    ctx.lineTo(50, -22);
    ctx.lineTo(24, -5);
    ctx.lineTo(-38, -6);
  } else {
    // Mio Sporty Ramping Klasik
    ctx.moveTo(-50, -22);
    ctx.lineTo(-14, -29);
    ctx.lineTo(12, -10);
    ctx.lineTo(32, -43);
    ctx.lineTo(45, -21);
    ctx.lineTo(22, -5);
    ctx.lineTo(-38, -6);
  }
  ctx.closePath();
  ctx.fill();

  // Striping Aksen Grafis Bodi
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-44, -22);
  ctx.lineTo(-16, -26);
  ctx.moveTo(24, -22);
  ctx.lineTo(42, -28);
  ctx.stroke();

  // Lampu Depan LED Sorot
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(45, -26);
  ctx.lineTo(52, -22);
  ctx.lineTo(43, -19);
  ctx.fill();

  // Windshield Smoke untuk NMAX & XMAX
  if (shape === 'xmax' || shape === 'nmax') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.beginPath();
    ctx.moveTo(34, -46);
    ctx.lineTo(24, shape === 'xmax' ? -67 : -60);
    ctx.lineTo(32, shape === 'xmax' ? -65 : -58);
    ctx.lineTo(43, -44);
    ctx.fill();
  }

  // 7. Jok (Standar vs Papas Tipis Drag) & Stang
  const seatHeight = cfg.seatSlim ? 4 : 8.5;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-48, -31 - seatHeight, 39, seatHeight, 3);
  ctx.fill();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(31, -43);
  ctx.lineTo(24, -54);
  ctx.stroke();

  // 8. Joki Aero Tuck saat Balap
  if (isRacing) {
    ctx.fillStyle = '#1e293b'; // Jaket Balap
    ctx.beginPath();
    ctx.ellipse(-8, -46, 23, 8.5, -0.12, 0, Math.PI * 2);
    ctx.fill();
    // Lengan ke stang
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(4, -48);
    ctx.lineTo(24, -53);
    ctx.stroke();
    // Helm Fullface + Visor Smoke
    ctx.fillStyle = cfg.color;
    ctx.beginPath();
    ctx.arc(15, -54, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(16, -57, 8, 5);
  }

  ctx.restore();
}

// ================== VISUAL TREK KOTA REALISTIS ==================
let smokeParticles = [];

function drawCityTrack(track, dist) {
  // Gradasi Langit
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 175);
  skyGrad.addColorStop(0, track.skyTop);
  skyGrad.addColorStop(1, track.skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 800, 175);

  // Lapisan Parallax Jauh (Landmark Khas Tiap Kota)
  const farScroll = (dist * 4) % 800;
  ctx.save();
  ctx.translate(-farScroll, 0);
  for (let rep = 0; rep < 2; rep++) {
    const ox = rep * 800;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    if (track.landmark === 'bandung') {
      // Pylon Flyover Pasupati & Tusuk Sate Gedung Sate
      ctx.fillRect(ox + 220, 48, 12, 127);
      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 1.5;
      for (let c = 1; c <= 5; c++) {
        ctx.beginPath(); ctx.moveTo(ox + 226, 55); ctx.lineTo(ox + 226 - c * 26, 175); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox + 226, 55); ctx.lineTo(ox + 226 + c * 26, 175); ctx.stroke();
      }
      ctx.fillRect(ox + 520, 115, 130, 60);
      ctx.fillRect(ox + 582, 78, 6, 40);
    } else if (track.landmark === 'jogja') {
      // Siluet Gunung Merapi & Tugu Jogja
      ctx.beginPath();
      ctx.moveTo(ox + 80, 175); ctx.lineTo(ox + 260, 70); ctx.lineTo(ox + 440, 175);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(ox + 590, 115, 16, 60);
      ctx.beginPath();
      ctx.moveTo(ox + 586, 115); ctx.lineTo(ox + 598, 86); ctx.lineTo(ox + 610, 115);
      ctx.fill();
    } else if (track.landmark === 'surabaya') {
      // Bentang Jembatan Suramadu
      ctx.fillRect(ox + 180, 50, 10, 125);
      ctx.fillRect(ox + 540, 50, 10, 125);
      ctx.fillRect(ox + 0, 135, 800, 8);
    } else if (track.landmark === 'sentul') {
      // Bukit Hambalang & Tribun Besar Sentul
      ctx.beginPath();
      ctx.moveTo(ox, 175); ctx.quadraticCurveTo(ox + 240, 85, ox + 500, 175);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox + 420, 105, 280, 70);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ox + 410, 98, 300, 10);
    } else {
      // Gedung Kota (Depok Juanda / Jakarta Kemayoran / Semarang)
      for (let b = 0; b < 8; b++) {
        const bh = 55 + ((b * 37) % 65);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ox + b * 100, 175 - bh, 72, bh);
      }
    }
  }
  ctx.restore();

  // Tiang Lampu Jalan Sorot, Pohon & Penonton Pinggir Trek (Parallax Cepat)
  const midScroll = (dist * 26) % 200;
  for (let i = -1; i < 6; i++) {
    const lx = i * 200 - midScroll;
    // Tiang lampu
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 175); ctx.lineTo(lx, 78); ctx.lineTo(lx + 24, 78);
    ctx.stroke();

    // Efek Cahaya Lampu Jalan
    const glow = ctx.createRadialGradient(lx + 24, 82, 2, lx + 24, 120, 75);
    glow.addColorStop(0, track.lightColor + '55');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.moveTo(lx + 24, 78); ctx.lineTo(lx - 26, 175); ctx.lineTo(lx + 74, 175);
    ctx.fill();
  }

  // Pagar Pembatas & Kerb Merah-Putih Sirkuit
  const kerbScroll = (dist * 45) % 40;
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 162, 800, 13);
  for (let k = -1; k < 22; k++) {
    ctx.fillStyle = k % 2 === 0 ? '#ef4444' : '#f8fafc';
    ctx.fillRect(k * 40 - kerbScroll, 172, 20, 6);
  }

  // Aspal Realistis + Jejak Karet Ban Hitam (Rubber Marks)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 178, 800, 162);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 212, 800, 18);
  ctx.fillRect(0, 294, 800, 20);

  // Garis Tengah Putus-Putus
  ctx.strokeStyle = '#facc15';
  ctx.setLineDash([32, 24]);
  ctx.lineDashOffset = -(dist * 45);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 255);
  ctx.lineTo(800, 255);
  ctx.stroke();
  ctx.setLineDash([]);

  // Papan Penanda Jarak (100M & Garis Finis 201M Kotak-Kotak)
  [100, 201].forEach(markM => {
    const sx = 165 + (markM - dist) * 26;
    if (sx > -50 && sx < 850) {
      if (markM === 100) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(sx, 142, 42, 22);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('100M', sx + 5, 157);
      } else {
        for (let r = 0; r < 8; r++) {
          ctx.fillStyle = r % 2 === 0 ? '#ffffff' : '#0f172a';
          ctx.fillRect(sx, 178 + r * 20, 12, 20);
          ctx.fillStyle = r % 2 === 0 ? '#0f172a' : '#ffffff';
          ctx.fillRect(sx + 12, 178 + r * 20, 12, 20);
        }
      }
    }
  });
}

// ================== MESIN FISIKA BALAP 201M ==================
let mode = 'GARAGE';
let activeTrack = TRACKS[0];
let gasHeld = false;
let rpm = 1500;
let countTimer = 0;
let pDist = 0, pVel = 0, pTime = 0, pFinished = false;
let eDist = 0, eVel = 0, eTime = 0, eFinished = false;
let boostUsed = false, boostTimer = 0, launchBonus = 1;
let wheelSpinAngle = 0;

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
    boostTimer = 1.5;
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
  smokeParticles = [];

  document.getElementById('garageSection').classList.add('hidden');
  document.getElementById('raceControls').classList.remove('hidden');
  btnBackGarage.classList.add('hidden');
  btnBoost.disabled = false;
  raceBanner.classList.remove('hidden');
  raceBanner.textContent = `${activeTrack.city} • Jaga RPM di Zona Hijau!`;
}

let lastTS = performance.now();
function gameLoop(ts) {
  const dt = Math.min((ts - lastTS) / 1000, 0.05);
  lastTS = ts;
  const stats = getBikeStats(save.currentBike);

  if (mode === 'GARAGE') {
    // Ruang Garasi & Dyno Stand
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 340);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 340);

    // Lantai Keramik Bengkel
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 268, 800, 72);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let gx = 0; gx <= 800; gx += 80) {
      ctx.beginPath(); ctx.moveTo(gx, 268); ctx.lineTo(gx - 40, 340); ctx.stroke();
    }

    // Paddock / Meja Angkat Motor
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(250, 272, 300, 8);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`BENGKEL MODIF & DYNO — ${stats.base.name.toUpperCase()}`, 24, 38);
    ctx.fillStyle = '#facc15';
    ctx.font = '13px sans-serif';
    ctx.fillText(`CVT Lv.${stats.data.cvt} • BoreUp Lv.${stats.data.boreup} • ECU Lv.${stats.data.ecu} • Knalpot Lv.${stats.data.exhaust}`, 24, 60);

    drawDetailedScooter(400, 232, 1.95, stats.data, stats.base.shape, 0, false, false, 0);
  } else {
    // Update RPM & Balapan
    if (gasHeld) rpm = Math.min(10800, rpm + 9600 * dt);
    else rpm = Math.max(1500, rpm - 7600 * dt);

    // Asap Burnout Ban Belakang saat Tahan Gas Start
    if ((mode === 'COUNTDOWN' && rpm > 6000) || (mode === 'RACING' && pDist < 18)) {
      smokeParticles.push({ x: 115, y: 312, r: 6 + Math.random() * 6, a: 0.65 });
    }

    if (mode === 'COUNTDOWN') {
      countTimer += dt;
      if (countTimer >= 3.0) {
        mode = 'RACING';
        if (rpm >= 7200 && rpm <= 9300) {
          launchBonus = 1.16;
          raceBanner.textContent = '🚀 PERFECT LAUNCH! JOKI NUNDUK!';
        } else if (rpm > 9300) {
          launchBonus = 0.91;
          raceBanner.textContent = '⚠️ OVER-REV! BAN SPIN!';
        } else {
          launchBonus = 0.95;
          raceBanner.textContent = '💨 TELAT BUKA GAS!';
        }
      }
    } else if (mode === 'RACING') {
      if (!pFinished) {
        pTime += dt;
        if (boostTimer > 0) boostTimer -= dt;
        const throttle = gasHeld ? 1.0 : 0.2;
        const boostMult = boostTimer > 0 ? 1.28 : 1.0;
        const accel = (stats.hp * 1.46 * launchBonus * boostMult * throttle) - (pVel * 0.34);
        pVel = Math.max(0, pVel + accel * dt);
        pDist += pVel * dt;
        wheelSpinAngle += pVel * dt * 1.8;
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
        const reward = win ? activeTrack.prize : Math.round(activeTrack.prize * 0.22);
        save.money += reward;
        if (win && save.unlockedLevel === activeTrack.level && save.unlockedLevel < TRACKS.length) {
          save.unlockedLevel++;
        }
        saveGame();
        raceBanner.textContent = win
          ? `🏆 JUARA! ${pTime.toFixed(2)} dtk vs ${eTime.toFixed(2)} dtk (+${formatRp(reward)})`
          : `❌ KALAH TIPIS! ${pTime.toFixed(2)} dtk vs ${eTime.toFixed(2)} dtk (+${formatRp(reward)})`;
        btnBackGarage.classList.remove('hidden');
      }
    }

    drawCityTrack(activeTrack, pDist);

    // Efek Wheelie Kecil saat Tenaga Besar & Start Sempurna
    const wheelie = (mode === 'RACING' && pDist < 22 && stats.hp > 18 && launchBonus > 1.1) ? -0.11 : 0;

    // Gambar Motor Lawan & Pemain
    const enemyCfg = { ...defaultBikeConfig(activeTrack.lightColor), rimType: '17', exhaust: 2, cvt: 2, seatSlim: true };
    const enemyScreenX = 165 + (eDist - pDist) * 26;
    drawDetailedScooter(enemyScreenX, 222, 0.92, enemyCfg, activeTrack.enemyShape, wheelSpinAngle, true, false, 0);
    drawDetailedScooter(165, 306, 1.05, stats.data, stats.base.shape, wheelSpinAngle, true, boostTimer > 0, wheelie);

    // Render Kepulan Asap Ban
    smokeParticles.forEach(s => {
      s.x -= 60 * dt;
      s.y -= 18 * dt;
      s.r += 22 * dt;
      s.a -= 0.9 * dt;
      if (s.a > 0) {
        ctx.fillStyle = `rgba(226, 232, 240, ${s.a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    smokeParticles = smokeParticles.filter(s => s.a > 0);

    // Lampu Start Christmas Tree
    if (mode === 'COUNTDOWN' || pDist < 12) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(368, 46, 64, 114);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(368, 46, 64, 114);
      for (let l = 0; l < 3; l++) {
        ctx.fillStyle = countTimer > (l + 1) * 0.75 ? '#facc15' : '#334155';
        ctx.beginPath(); ctx.arc(400, 66 + l * 25, 8.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = mode === 'RACING' ? '#22c55e' : '#334155';
      ctx.beginPath(); ctx.arc(400, 142, 9.5, 0, Math.PI * 2); ctx.fill();
    }

    // Panel Tachometer RPM & Speedometer Digital
    ctx.fillStyle = 'rgba(9, 13, 22, 0.82)';
    ctx.fillRect(14, 14, 245, 58);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(14, 14, 245, 58);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 48, 225, 13);
    // Zona Hijau Launch
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.fillRect(24 + (7200 / 10800) * 225, 48, ((9300 - 7200) / 10800) * 225, 13);
    // Jarum Bar RPM
    ctx.fillStyle = rpm > 9300 ? '#ef4444' : rpm >= 7200 ? '#22c55e' : '#facc15';
    ctx.fillRect(24, 48, (rpm / 10800) * 225, 13);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px sans-serif';
    const kmh = Math.round(pVel * 3.6);
    ctx.fillText(`${Math.round(rpm)} RPM  •  ${kmh} km/j  •  ${Math.floor(pDist)}m`, 24, 36);
  }

  requestAnimationFrame(gameLoop);
}

updateTopBar();
renderTab();
requestAnimationFrame(gameLoop);