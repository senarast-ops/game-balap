const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BIKES = [
  { id: 'mio', name: 'Yamaha Mio Sporty 115', price: 0, baseCC: 113, baseHP: 9.0, shape: 'mio', defaultColor: '#facc15' },
  { id: 'fino', name: 'Yamaha Fino 115 Classic', price: 4800000, baseCC: 115, baseHP: 9.4, shape: 'fino', defaultColor: '#f8fafc' },
  { id: 'beat', name: 'Honda Beat Karbu 110', price: 6500000, baseCC: 108, baseHP: 9.6, shape: 'beat', defaultColor: '#ef4444' },
  { id: 'vario', name: 'Honda Vario 150 LED', price: 15000000, baseCC: 150, baseHP: 13.8, shape: 'vario', defaultColor: '#dc2626' },
  { id: 'aerox', name: 'Yamaha Aerox 155 Connected', price: 24500000, baseCC: 155, baseHP: 15.8, shape: 'aerox', defaultColor: '#2563eb' },
  { id: 'nmax', name: 'Yamaha NMAX 155 Old', price: 29000000, baseCC: 155, baseHP: 16.4, shape: 'nmax', defaultColor: '#1e293b' },
  { id: 'xmax', name: 'Yamaha XMAX 250 Connected', price: 58000000, baseCC: 250, baseHP: 23.5, shape: 'xmax', defaultColor: '#eab308' }
];

const UPGRADES = {
  cvt: { name: 'Kirian CVT Full Spek (Roller, Per 1500 RPM, Mangkok Kartel)', baseCost: 650000, hpGain: 1.5, ccGain: 0, maxLvl: 5 },
  boreup: { name: 'Paket Bore Up Piston Forged + Camshaft Racing', baseCost: 1600000, hpGain: 3.8, ccGain: 22, maxLvl: 5 },
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

// Mengambil uang lama dari versi pertama jika ada agar tidak hilang
const oldSave = JSON.parse(localStorage.getItem('dragMaticIndoSave'));
let save = JSON.parse(localStorage.getItem('dragMaticIndoSaveV3')) || {
  money: oldSave ? oldSave.money : 2500000,
  unlockedLevel: oldSave ? oldSave.unlockedLevel : 1,
  currentBike: 'mio',
  ownedBikes: { mio: defaultBikeConfig('#facc15') }
};

Object.keys(save.ownedBikes).forEach(k => {
  save.ownedBikes[k] = { ...defaultBikeConfig('#facc15'), ...save.ownedBikes[k] };
});

function saveGame() {
  localStorage.setItem('dragMaticIndoSaveV3', JSON.stringify(save));
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
          <div class="card-desc">+${upg.hpGain} HP ${upg.ccGain ? '• +' + upg.ccGain + 'cc' : ''} ${key === 'exhaust' && lvl === 0 ? '• Visual Knalpot Titanium Pelangi' : ''}</div>
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
        <div class="card-title">Setup Kaki-Kaki & Ban</div>
        <div class="card-desc">${stats.data.rimType === '17' ? 'Velg Jari-Jari Alumunium 17" Ban Tipis Drag (+0.7 HP)' : 'Velg Racing Cast Wheel 14" Ban Tebal Harian'}</div>
      </div>
      <button class="btn-action" onclick="togglePart('rimType')">Ubah 14" / 17"</button>
    `;
    container.appendChild(rimCard);

    const seatCard = document.createElement('div');
    seatCard.className = 'card';
    seatCard.innerHTML = `
      <div>
        <div class="card-title">Model Jok Motor</div>
        <div class="card-desc">${stats.data.seatSlim ? 'Jok Papas Tipis Drag Style (+0.4 HP)' : 'Jok Standar Empuk Harian / Touring'}</div>
      </div>
      <button class="btn-action" onclick="togglePart('seatSlim')">Ganti Jok</button>
    `;
    container.appendChild(seatCard);

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

    addSwatchCard('Warna Bodi Halus', BODY_COLORS, 'color');
    addSwatchCard('Warna Velg Anodize / Cat', RIM_COLORS, 'rimColor');
    addSwatchCard('Warna Per Shockbreaker Tabung', SHOCK_COLORS, 'shockColor');
    addSwatchCard('Warna Kaliper Rem Cakram', CALIPER_COLORS, 'caliperColor');

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

// ================== MESIN GAMBAR MOTOR REALISTIS MULTI-LAYER ==================
function drawRealisticMatic(x, y, scale, cfg, shape, wheelSpin, isRacing, flame, wheelieDeg = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const isMaxi = shape === 'xmax' || shape === 'nmax';
  const rearX = isMaxi ? -56 : -48;
  const frontX = isMaxi ? 58 : 50;

  if (wheelieDeg !== 0) {
    ctx.translate(rearX, 0);
    ctx.rotate(wheelieDeg);
    ctx.translate(-rearX, 0);
  }

  // Bayangan bawah motor di aspal/lantai
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 22, isMaxi ? 78 : 68, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const is17 = cfg.rimType === '17';
  const tireR = is17 ? 24 : (isMaxi ? 21 : 19);
  const tireThick = is17 ? 3.5 : (isMaxi ? 7.5 : 6.5);
  const rimR = tireR - tireThick / 2 - 1;

  // FUNGSI RODA DETAIL
  function drawWheel(wx, hasDisc) {
    ctx.save();
    ctx.translate(wx, 0);

    // Ban luar karet gelap + garis profil ban
    ctx.beginPath();
    ctx.arc(0, 0, tireR, 0, Math.PI * 2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = tireThick;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, tireR + tireThick / 2 - 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Palang / Jari-Jari Velg berputar
    ctx.save();
    ctx.rotate(wheelSpin);
    if (is17) {
      for (let i = 0; i < 18; i++) {
        const a = (Math.PI * 2 * i) / 18;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
        ctx.lineTo(Math.cos(a + 0.25) * rimR, Math.sin(a + 0.25) * rimR);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * rimR, Math.sin(a) * rimR);
        ctx.strokeStyle = cfg.rimColor;
        ctx.lineWidth = 3.4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
    ctx.restore();

    // Bibir Velg Anodize
    ctx.beginPath();
    ctx.arc(0, 0, rimR, 0, Math.PI * 2);
    ctx.strokeStyle = cfg.rimColor;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Piringan Cakram Floating
    if (hasDisc) {
      ctx.beginPath();
      ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.8;
      ctx.stroke();
      // Pin floating cakram oranye/emas
      for (let p = 0; p < 6; p++) {
        const pa = (Math.PI * 2 * p) / 6 + wheelSpin;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(Math.cos(pa) * 8.5, Math.sin(pa) * 8.5, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tromol & Baut As Roda Probolt
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();

    ctx.restore();
  }

  // Gambar Roda Belakang & Depan
  drawWheel(rearX, isMaxi);
  drawWheel(frontX, true);

  // 1. BLOK MESIN BAWAH, FILTER UDARA & BAK CVT PROPORSIONAL
  // Silinder Head & Leher Angsa bawah dek
  ctx.fillStyle = '#334155';
  ctx.fillRect(rearX + 26, -12, 26, 12);
  // Box Filter Udara di atas CVT
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(rearX - 6, -21, 30, 10, 3);
  ctx.fill();

  // Bak CVT Matic Khas (Bulat besar di depan, membulat kecil di as belakang)
  const cvtGrad = ctx.createLinearGradient(rearX - 8, -12, rearX + 28, 6);
  cvtGrad.addColorStop(0, cfg.cvt > 0 ? '#64748b' : '#94a3b8');
  cvtGrad.addColorStop(1, '#334155');
  ctx.fillStyle = cvtGrad;
  ctx.beginPath();
  ctx.arc(rearX + 22, -3, 8.5, 0, Math.PI * 2);
  ctx.arc(rearX, -1, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(rearX, -8.5, 22, 14);

  // Cover Kipas Pulley Depan + Baut Probolt Ungu
  ctx.beginPath();
  ctx.arc(rearX + 22, -3, 5, 0, Math.PI * 2);
  ctx.fillStyle = cfg.cvt >= 2 ? '#dc2626' : '#0f172a';
  ctx.fill();
  for (let b = 0; b < 5; b++) {
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(rearX + 2 + b * 5, -7.5, 1.6, 1.6);
  }

  // 2. SHOCKBREAKER BELAKANG ULIR + TABUNG SUB-TANK EMAS
  ctx.save();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(rearX + 2, -6);
  ctx.lineTo(rearX + 12, -30);
  ctx.stroke();
  // Ulir Per Shockbreaker
  ctx.strokeStyle = cfg.shockColor;
  ctx.lineWidth = 4.5;
  ctx.setLineDash([2.5, 2]);
  ctx.beginPath();
  ctx.moveTo(rearX + 3, -9);
  ctx.lineTo(rearX + 11, -27);
  ctx.stroke();
  ctx.setLineDash([]);
  // Tabung Shock Emas (Ohlins/KTC Style)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(rearX + 13, -30, 4.5, 9);
  ctx.restore();

  // 3. KNALPOT STANDAR VS RACING TITANIUM BLUE-BURN
  if (cfg.exhaust > 0) {
    // Leher Pipa Cekung Bawah Mesin (Titanium Rainbow)
    const pGrad = ctx.createLinearGradient(rearX + 34, 4, rearX - 18, -14);
    pGrad.addColorStop(0, '#f59e0b');
    pGrad.addColorStop(0.4, '#a855f7');
    pGrad.addColorStop(0.75, '#0ea5e9');
    pGrad.addColorStop(1, '#e2e8f0');
    ctx.strokeStyle = pGrad;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(rearX + 36, -2);
    ctx.bezierCurveTo(rearX + 34, 12, rearX + 10, 10, rearX - 4, -7);
    ctx.stroke();

    // Tabung Silencer Racing Miring ke Atas + Moncong Karbon
    ctx.save();
    ctx.translate(rearX - 6, -9);
    ctx.rotate(-0.32);
    const silGrad = ctx.createLinearGradient(-26, -4, 4, 4);
    silGrad.addColorStop(0, '#cbd5e1');
    silGrad.addColorStop(0.5, '#f8fafc');
    silGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = silGrad;
    ctx.beginPath();
    ctx.roundRect(-26, -4.5, 28, 9, 2);
    ctx.fill();
    // Endcap Carbon Hitam & Bracket Knalpot
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-26, -4.5); ctx.lineTo(-31, -2.5); ctx.lineTo(-31, 2.5); ctx.lineTo(-26, 4.5);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-13, -5, 3, 10);
    ctx.restore();

    if (flame) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(rearX - 35, -18);
      ctx.lineTo(rearX - 65 - Math.random() * 18, -28);
      ctx.lineTo(rearX - 33, -13);
      ctx.fill();
    }
  } else {
    // Knalpot Standar Hitam Doff + Tameng Pelindung Panas Silver
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(rearX + 34, 0);
    ctx.quadraticCurveTo(rearX + 22, 10, rearX + 2, -4);
    ctx.stroke();
    ctx.save();
    ctx.translate(rearX - 4, -6);
    ctx.rotate(-0.18);
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.roundRect(-24, -4.5, 28, 9, 3); ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-18, -2, 16, 3.5);
    ctx.restore();
  }

  // 4. SPAKBOR BELAKANG, SPAKBOR DEPAN & GARPU TELESKOPIK
  // Spakbor Kolong Belakang + Plat Nomor
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(rearX - 8, -32);
  ctx.lineTo(rearX - 24, -14);
  ctx.lineTo(rearX - 18, -13);
  ctx.lineTo(rearX - 2, -30);
  ctx.fill();

  // Spakbor Depan Melengkung di Atas Ban
  ctx.fillStyle = cfg.color;
  ctx.beginPath();
  ctx.arc(frontX, 0, tireR + 4.5, -Math.PI * 0.82, -Math.PI * 0.22);
  ctx.arc(frontX, 0, tireR - 1, -Math.PI * 0.22, -Math.PI * 0.82, true);
  ctx.closePath();
  ctx.fill();

  // Shock Depan Teleskopik (Tabung Bawah Hitam/Silver + As Chrome)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(frontX - 16, -42);
  ctx.lineTo(frontX - 6, -16);
  ctx.stroke();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(frontX - 6, -17);
  ctx.lineTo(frontX, 1);
  ctx.stroke();

  // Kaliper Rem Depan (Nissin / Brembo)
  ctx.fillStyle = cfg.caliperColor;
  ctx.beginPath();
  ctx.roundRect(frontX - 9, -8, 7.5, 8.5, 2);
  ctx.fill();

  // 5. BODI KASAR HITam (DEK KAKI, INNER LEGSHIELD & UNDERCOWL)
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  if (isMaxi) {
    // Dek Punggung Tengah (Tunnel) khas NMAX & XMAX
    ctx.moveTo(rearX + 6, -32);
    ctx.lineTo(-4, -26);
    ctx.lineTo(18, -25);
    ctx.lineTo(30, -48);
    ctx.lineTo(36, -45);
    ctx.lineTo(28, -9);
    ctx.lineTo(-22, -9);
  } else if (shape === 'aerox') {
    // Dek Tengah Sporty Aerox
    ctx.moveTo(rearX + 8, -33);
    ctx.lineTo(-2, -24);
    ctx.lineTo(16, -21);
    ctx.lineTo(28, -46);
    ctx.lineTo(34, -44);
    ctx.lineTo(24, -10);
    ctx.lineTo(-18, -10);
  } else {
    // Dek Rata Pijakan Kaki Khas Mio / Beat / Vario / Fino
    ctx.moveTo(rearX + 10, -30);
    ctx.lineTo(-8, -14);
    ctx.lineTo(19, -14);
    ctx.lineTo(27, -45);
    ctx.lineTo(33, -43);
    ctx.lineTo(24, -9);
    ctx.lineTo(-16, -9);
  }
  ctx.closePath();
  ctx.fill();

  // 6. BODI HALUS BERWARNA + SHADING KILAP CAT OTOMOTIF
  ctx.fillStyle = cfg.color;
  if (shape === 'mio') {
    // Bodi Belakang Ramping Melengkung Mio Sporty
    ctx.beginPath();
    ctx.moveTo(rearX - 14, -33);
    ctx.quadraticCurveTo(rearX + 8, -34, -8, -28);
    ctx.lineTo(-12, -13);
    ctx.quadraticCurveTo(rearX + 8, -20, rearX - 14, -33);
    ctx.fill();
    // Tameng Depan & Sayap Samping Mio (Lampu Senyum di Tameng)
    ctx.beginPath();
    ctx.moveTo(18, -13);
    ctx.lineTo(29, -44);
    ctx.quadraticCurveTo(44, -36, 46, -24);
    ctx.quadraticCurveTo(36, -15, 23, -10);
    ctx.closePath();
    ctx.fill();
    // Batok Kepala Stang Mio
    ctx.beginPath();
    ctx.ellipse(29, -52, 9, 5.5, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // Reflektor Lampu Depan Batok & Sein Tameng
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath(); ctx.ellipse(35, -53, 3.5, 4, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, -31); ctx.lineTo(45, -25); ctx.lineTo(38, -25); ctx.fill();

  } else if (shape === 'fino') {
    // Bodi Belakang Membulat Klasik Retro Fino
    ctx.beginPath();
    ctx.moveTo(rearX - 12, -26);
    ctx.bezierCurveTo(rearX - 8, -38, -6, -36, -8, -14);
    ctx.lineTo(rearX - 12, -26);
    ctx.fill();
    // Tebeng Depan Melengkung Klasik
    ctx.beginPath();
    ctx.moveTo(18, -13);
    ctx.quadraticCurveTo(25, -36, 30, -45);
    ctx.bezierCurveTo(46, -40, 48, -24, 24, -10);
    ctx.fill();
    // Lampu Bulat Chrome Khas Fino
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.arc(34, -52, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(37, -52, 4, -1.2, 1.2); ctx.fill();

  } else if (shape === 'beat' || shape === 'vario') {
    const isVario = shape === 'vario';
    // Bodi Samping Belakang Tajam Agresif
    ctx.beginPath();
    ctx.moveTo(rearX - 15, -35);
    ctx.lineTo(-8, -30);
    ctx.lineTo(-13, -14);
    ctx.lineTo(rearX - 4, -22);
    ctx.closePath();
    ctx.fill();
    // Sayap Depan Tajam Menyudut (Dual Keen Eyes LED)
    ctx.beginPath();
    ctx.moveTo(17, -13);
    ctx.lineTo(30, -46);
    ctx.lineTo(isVario ? 51 : 47, -26);
    ctx.lineTo(36, -18);
    ctx.lineTo(24, -9);
    ctx.closePath();
    ctx.fill();
    // Batok Stang Tajam
    ctx.beginPath();
    ctx.moveTo(22, -52); ctx.lineTo(35, -56); ctx.lineTo(38, -49); ctx.lineTo(25, -47);
    ctx.fill();
    // Lampu LED Sipit Tajam di Tebeng Bawah
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(41, -30); ctx.lineTo(isVario ? 50 : 46, -26); ctx.lineTo(42, -24);
    ctx.fill();

  } else if (shape === 'aerox') {
    // Buntut Belakang Nungging Sporty Aerox
    ctx.beginPath();
    ctx.moveTo(rearX - 16, -40);
    ctx.lineTo(-6, -32);
    ctx.lineTo(-10, -19);
    ctx.lineTo(rearX - 6, -29);
    ctx.closePath();
    ctx.fill();
    // Fairing Samping Berlapis Aerodinamis (X-Shape)
    ctx.beginPath();
    ctx.moveTo(8, -22);
    ctx.lineTo(31, -47);
    ctx.lineTo(52, -25);
    ctx.lineTo(34, -10);
    ctx.lineTo(18, -12);
    ctx.closePath();
    ctx.fill();
    // Batok & Visor Kecil Aerox
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.moveTo(25, -54); ctx.lineTo(35, -57); ctx.lineTo(36, -48); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.moveTo(44, -29); ctx.lineTo(52, -25); ctx.lineTo(45, -23); ctx.fill();

  } else if (isMaxi) {
    const isXmax = shape === 'xmax';
    // Bodi Belakang Lebar Memanjang Maxi + Boomerang Side Panel
    ctx.beginPath();
    ctx.moveTo(rearX - 18, -36);
    ctx.lineTo(-8, -34);
    ctx.lineTo(6, -23);
    ctx.lineTo(-14, -14);
    ctx.lineTo(rearX - 8, -23);
    ctx.closePath();
    ctx.fill();
    // Fairing Depan Besar Gambot Maxi
    ctx.beginPath();
    ctx.moveTo(14, -24);
    ctx.lineTo(34, -50);
    ctx.lineTo(isXmax ? 60 : 56, -26);
    ctx.lineTo(38, -9);
    ctx.lineTo(18, -10);
    ctx.closePath();
    ctx.fill();
    // Aksen Boomerang Silver/Abu Khas NMAX & XMAX
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-4, -26); ctx.lineTo(16, -24); ctx.lineTo(22, -11); ctx.lineTo(12, -11);
    ctx.fill();
    // Windshield Smoke Tinggi Proporsional
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.beginPath();
    ctx.moveTo(33, -49);
    ctx.quadraticCurveTo(29, isXmax ? -70 : -62, 23, isXmax ? -72 : -63);
    ctx.lineTo(32, isXmax ? -68 : -60);
    ctx.lineTo(43, -44);
    ctx.closePath();
    ctx.fill();
    // Lampu Depan LED Proyektor Tajam
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(49, -31); ctx.lineTo(isXmax ? 60 : 56, -26); ctx.lineTo(49, -23);
    ctx.fill();
  }

  // Highlight Kilap Cat di Bodi Depan & Belakang
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(rearX - 10, -32);
  ctx.lineTo(-12, -29);
  ctx.moveTo(28, -38);
  ctx.lineTo(42, -26);
  ctx.stroke();

  // Lampu Stop Belakang Merah Ruby
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(rearX - 14, isMaxi ? -33 : (shape === 'aerox' ? -37 : -31), 3, 0, Math.PI * 2);
  ctx.fill();

  // 7. JOK MOTOR BERKONTUR (STANDAR BERTINGKAT VS PAPAS TIPIS DRAG) & BEHEL BELAKANG
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  if (cfg.seatSlim) {
    // Jok Papas Rata Tipis Kulit Carbon
    ctx.moveTo(rearX - 10, -35);
    ctx.quadraticCurveTo(-26, -39, -6, -31);
    ctx.lineTo(-8, -28);
    ctx.lineTo(rearX - 11, -32);
  } else if (isMaxi) {
    // Jok Lebar Bertingkat Lumbar Support Khas XMAX/NMAX
    ctx.moveTo(rearX - 14, -41);
    ctx.lineTo(-28, -42);
    ctx.lineTo(-22, -36);
    ctx.lineTo(-4, -35);
    ctx.lineTo(-6, -26);
    ctx.lineTo(rearX - 14, -34);
  } else {
    // Jok Standar Empuk Melengkung
    ctx.moveTo(rearX - 11, -38);
    ctx.quadraticCurveTo(-26, -40, -6, -33);
    ctx.lineTo(-8, -27);
    ctx.lineTo(rearX - 12, -32);
  }
  ctx.closePath();
  ctx.fill();

  // Behel Pegangan Belakang Silver
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(rearX - 10, -35);
  ctx.lineTo(rearX - 19, -37);
  ctx.stroke();

  // Stang, Handgrip & Handle Rem
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(29, -46);
  ctx.lineTo(22, -55);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(17, -57, 8, 3.5);

  // 8. JOKI BALAP PROPORSIONAL (NUNDUK AERO TUCK SAAT BALAP)
  if (isRacing) {
    // Kaki Tekuk di Belakang & Sepatu Balap
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -38); // Pinggul
    ctx.lineTo(-4, -22);  // Lutut
    ctx.lineTo(-18, -14); // Pijakan kaki
    ctx.stroke();

    // Punggung Jaket Balap Merunduk
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-6, -47, 21, 8, -0.14, 0, Math.PI * 2);
    ctx.fill();

    // Lengan Memegang Stang
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(6, -49);
    ctx.lineTo(20, -55);
    ctx.stroke();

    // Helm Fullface Aerodinamis + Visor Dark Smoke
    ctx.fillStyle = cfg.color;
    ctx.beginPath();
    ctx.arc(15, -56, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(17, -59); ctx.lineTo(24, -56); ctx.lineTo(17, -53);
    ctx.fill();
  }

  ctx.restore();
}

// ================== VISUAL TREK KOTA REALISTIS ==================
let smokeParticles = [];

function drawCityTrack(track, dist) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 175);
  skyGrad.addColorStop(0, track.skyTop);
  skyGrad.addColorStop(1, track.skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 800, 175);

  const farScroll = (dist * 4) % 800;
  ctx.save();
  ctx.translate(-farScroll, 0);
  for (let rep = 0; rep < 2; rep++) {
    const ox = rep * 800;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    if (track.landmark === 'bandung') {
      ctx.fillRect(ox + 220, 48, 12, 127);
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.lineWidth = 1.5;
      for (let c = 1; c <= 5; c++) {
        ctx.beginPath(); ctx.moveTo(ox + 226, 55); ctx.lineTo(ox + 226 - c * 26, 175); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox + 226, 55); ctx.lineTo(ox + 226 + c * 26, 175); ctx.stroke();
      }
      ctx.fillRect(ox + 520, 115, 130, 60);
      ctx.fillRect(ox + 582, 78, 6, 40);
    } else if (track.landmark === 'jogja') {
      ctx.beginPath();
      ctx.moveTo(ox + 80, 175); ctx.lineTo(ox + 260, 70); ctx.lineTo(ox + 440, 175);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(ox + 590, 115, 16, 60);
      ctx.beginPath();
      ctx.moveTo(ox + 586, 115); ctx.lineTo(ox + 598, 86); ctx.lineTo(ox + 610, 115);
      ctx.fill();
    } else if (track.landmark === 'surabaya') {
      ctx.fillRect(ox + 180, 50, 10, 125);
      ctx.fillRect(ox + 540, 50, 10, 125);
      ctx.fillRect(ox, 135, 800, 8);
    } else if (track.landmark === 'sentul') {
      ctx.beginPath();
      ctx.moveTo(ox, 175); ctx.quadraticCurveTo(ox + 240, 85, ox + 500, 175);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox + 420, 105, 280, 70);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ox + 410, 98, 300, 10);
    } else {
      for (let b = 0; b < 8; b++) {
        const bh = 55 + ((b * 37) % 65);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ox + b * 100, 175 - bh, 72, bh);
        // Jendela gedung menyala malam
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        for (let wy = 185 - bh; wy < 165; wy += 14) {
          ctx.fillRect(ox + b * 100 + 12, wy, 10, 6);
          ctx.fillRect(ox + b * 100 + 36, wy, 10, 6);
        }
      }
    }
  }
  ctx.restore();

  // Lampu Jalan Sorot & Penonton
  const midScroll = (dist * 26) % 200;
  for (let i = -1; i < 6; i++) {
    const lx = i * 200 - midScroll;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 175); ctx.lineTo(lx, 78); ctx.lineTo(lx + 24, 78);
    ctx.stroke();

    const glow = ctx.createRadialGradient(lx + 24, 82, 2, lx + 24, 120, 75);
    glow.addColorStop(0, track.lightColor + '55');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.moveTo(lx + 24, 78); ctx.lineTo(lx - 26, 175); ctx.lineTo(lx + 74, 175);
    ctx.fill();
  }

  // Pembatas Beton & Kerb Merah-Putih
  const kerbScroll = (dist * 45) % 40;
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 162, 800, 13);
  for (let k = -1; k < 22; k++) {
    ctx.fillStyle = k % 2 === 0 ? '#ef4444' : '#f8fafc';
    ctx.fillRect(k * 40 - kerbScroll, 172, 20, 6);
  }

  // Aspal Sirkuit + Bekas Ban Hitam
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 178, 800, 162);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 212, 800, 18);
  ctx.fillRect(0, 294, 800, 20);

  ctx.strokeStyle = '#facc15';
  ctx.setLineDash([32, 24]);
  ctx.lineDashOffset = -(dist * 45);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 255);
  ctx.lineTo(800, 255);
  ctx.stroke();
  ctx.setLineDash([]);

  // Penanda 100M & Garis Finis 201M
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
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 340);
    bgGrad.addColorStop(0, '#0b1120');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 340);

    // Cahaya Lampu Studio Bengkel di Atas Motor
    const spot = ctx.createRadialGradient(400, 90, 15, 400, 190, 260);
    spot.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    spot.addColorStop(1, 'transparent');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, 800, 340);

    // Lantai Bengkel Kotak-Kotak
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 272, 800, 68);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let gx = 0; gx <= 800; gx += 80) {
      ctx.beginPath(); ctx.moveTo(gx, 272); ctx.lineTo(gx - 40, 340); ctx.stroke();
    }

    // Meja Hidrolik Merah Bengkel
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(220, 276, 360, 7);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`BENGKEL MODIF & DYNO V3 — ${stats.base.name.toUpperCase()}`, 24, 36);
    ctx.fillStyle = '#facc15';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Kirian Lv.${stats.data.cvt}  •  BoreUp Lv.${stats.data.boreup}  •  ECU Lv.${stats.data.ecu}  •  Knalpot Lv.${stats.data.exhaust}`, 24, 58);

    drawRealisticMatic(400, 232, 2.05, stats.data, stats.base.shape, 0, false, false, 0);
  } else {
    if (gasHeld) rpm = Math.min(10800, rpm + 9600 * dt);
    else rpm = Math.max(1500, rpm - 7600 * dt);

    if ((mode === 'COUNTDOWN' && rpm > 6000) || (mode === 'RACING' && pDist < 18)) {
      smokeParticles.push({ x: 112, y: 312, r: 6 + Math.random() * 6, a: 0.6 });
    }

    if (mode === 'COUNTDOWN') {
      countTimer += dt;
      if (countTimer >= 3.0) {
        mode = 'RACING';
        if (rpm >= 7200 && rpm <= 9300) {
          launchBonus = 1.16;
          raceBanner.textContent = '🚀 PERFECT LAUNCH! GAS POL!';
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

    const wheelie = (mode === 'RACING' && pDist < 22 && stats.hp > 18 && launchBonus > 1.1) ? -0.10 : 0;
    const enemyCfg = { ...defaultBikeConfig(activeTrack.lightColor), rimType: '17', exhaust: 2, cvt: 2, seatSlim: true };
    const enemyScreenX = 165 + (eDist - pDist) * 26;

    drawRealisticMatic(enemyScreenX, 220, 0.95, enemyCfg, activeTrack.enemyShape, wheelSpinAngle, true, false, 0);
    drawRealisticMatic(165, 304, 1.08, stats.data, stats.base.shape, wheelSpinAngle, true, boostTimer > 0, wheelie);

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

    ctx.fillStyle = 'rgba(9, 13, 22, 0.84)';
    ctx.fillRect(14, 14, 245, 58);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(14, 14, 245, 58);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 48, 225, 13);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.fillRect(24 + (7200 / 10800) * 225, 48, ((9300 - 7200) / 10800) * 225, 13);
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