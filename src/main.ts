import Phaser from 'phaser';
import './styles.css';

type Track = { title: string; file: string; code: string };

const tracks: Track[] = [
  { title: 'Calma Te', file: 'CWeeD - Calma Te.mp3', code: 'CWC-01' },
  { title: 'Conquistador (Bonus Track)', file: 'CWeeD - Conquistador (Bonus Track).mp3', code: 'CWC-02' },
  { title: 'Domingo Podrido', file: 'CWeeD - Domingo Podrido.mp3', code: 'CWC-03' },
  { title: 'Más Que Yo', file: 'CWeeD - Más Que Yo.mp3', code: 'CWC-04' },
  { title: 'No Están Preparados', file: 'CWeeD - No Están Preparados.mp3', code: 'CWC-05' },
  { title: 'No Me Verás Venir', file: 'CWeeD - No Me Verás Venir.mp3', code: 'CWC-06' },
  { title: 'No soy de cuentos', file: 'CWeeD - No soy de cuentos.mp3', code: 'CWC-07' },
  { title: 'Pocos Compas', file: 'CWeeD - Pocos Compas.mp3', code: 'CWC-08' },
  { title: 'Provocan', file: 'CWeeD - Provocan.mp3', code: 'CWC-09' },
  { title: 'Seducción de Mente', file: 'CWeeD - Seducción de Mente.mp3', code: 'CWC-10' },
  { title: 'Te lo juro', file: 'CWeeD - Te lo juro.mp3', code: 'CWC-11' },
  { title: 'Todo Bajo Control', file: 'CWeeD - Todo Bajo Control.mp3', code: 'CWC-12' },
  { title: 'Yo Pongo Las Reglas', file: 'CWeeD - Yo Pongo Las Reglas.mp3', code: 'CWC-13' }
];

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#player" aria-label="CWC inicio">
        <span class="brand-mark">CWC</span>
        <span class="brand-copy"><b>CHARLIE WEED CREW</b><small>NO SOY DE CUENTOS // 13 CUTS</small></span>
      </a>
      <div class="top-tags"><span>BOOM BAP</span><span>METAL BLOOD</span><span>CR UNDERGROUND</span></div>
    </header>

    <section class="hero" id="player">
      <div class="hero-copy">
        <p class="eyebrow">CHARLIE WEED CREW PRESENTA</p>
        <h1>NO SOY<br><em>DE CUENTOS</em></h1>
        <p class="dek">Rap de concreto, riffs en la sangre y una tornamesa que no pide permiso. Poné la aguja y dejá que el disco haga el resto.</p>
        <div class="stamp-row"><span class="stamp">13 TRACKS</span><span class="stamp ghost">PLAY LOUD</span></div>
      </div>

      <div class="deck-wrap">
        <div class="deck" id="deck">
          <div class="deck-label">CWC // DIRECT DRIVE</div>
          <div class="platter-wrap">
            <div class="vinyl" id="vinyl">
              <div class="vinyl-ring r1"></div><div class="vinyl-ring r2"></div><div class="vinyl-ring r3"></div>
              <div class="vinyl-label"><b>CWC</b><span id="labelTrack">01</span><small>33⅓ RPM</small></div>
              <div class="spindle"></div>
            </div>
            <div class="needle-base"><div class="tonearm" id="tonearm"><div class="needle-head"></div></div></div>
          </div>
          <div class="deck-controls">
            <button class="transport primary" id="playBtn" aria-label="Reproducir">▶</button>
            <button class="transport" id="prevBtn" aria-label="Anterior">↶</button>
            <button class="transport" id="nextBtn" aria-label="Siguiente">↷</button>
            <div class="readout"><span>NOW CUTTING</span><b id="deckTitle">Calma Te</b></div>
            <div class="vu"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
    </section>

    <section class="console">
      <div class="now">
        <span class="cut" id="cutCode">CWC-01</span>
        <div><small>SONANDO AHORA</small><h2 id="nowTitle">Calma Te</h2><p>CWeeD · No soy de cuentos</p></div>
      </div>
      <div class="timeline"><span id="currentTime">0:00</span><input id="seek" type="range" min="0" max="1000" value="0"><span id="duration">0:00</span></div>
      <div class="volume"><span>VOL</span><input id="volume" type="range" min="0" max="1" step="0.01" value="0.8"></div>
    </section>

    <section class="track-section">
      <div class="section-head"><p>THE RECORD</p><h3>TRACKLIST</h3><span>CLICK A CUT // DROP THE NEEDLE</span></div>
      <div class="tracklist" id="tracklist"></div>
    </section>

    <footer><b>CWC</b><span>CHARLIE WEED CREW // COSTA RICA</span><small>BOOM BAP WITH METAL TEETH</small></footer>
  </main>
  <audio id="audio" preload="metadata"></audio>
`;

const audio = document.querySelector<HTMLAudioElement>('#audio')!;
const tracklist = document.querySelector<HTMLDivElement>('#tracklist')!;
const vinyl = document.querySelector<HTMLDivElement>('#vinyl')!;
const tonearm = document.querySelector<HTMLDivElement>('#tonearm')!;
const playBtn = document.querySelector<HTMLButtonElement>('#playBtn')!;
const nextBtn = document.querySelector<HTMLButtonElement>('#nextBtn')!;
const prevBtn = document.querySelector<HTMLButtonElement>('#prevBtn')!;
const seek = document.querySelector<HTMLInputElement>('#seek')!;
const volume = document.querySelector<HTMLInputElement>('#volume')!;

let current = 0;
let switching = false;
let raf = 0;

const fmt = (s: number) => Number.isFinite(s) ? `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}` : '0:00';
const audioPath = (file: string) => `/audio/${encodeURIComponent(file).replace(/%2F/g, '/')}`;

function renderTracks() {
  tracklist.innerHTML = tracks.map((t, i) => `
    <button class="track ${i === current ? 'active' : ''}" data-index="${i}">
      <span class="track-num">${String(i+1).padStart(2,'0')}</span>
      <span class="track-main"><b>${t.title}</b><small>${t.code} // CHARLIE WEED CREW</small></span>
      <span class="track-state">${i === current ? 'NOW SPINNING' : 'DROP NEEDLE'}</span>
      <span class="track-arrow">↗</span>
    </button>`).join('');
}

function updateMeta() {
  const t = tracks[current];
  document.querySelector('#nowTitle')!.textContent = t.title;
  document.querySelector('#deckTitle')!.textContent = t.title;
  document.querySelector('#cutCode')!.textContent = t.code;
  document.querySelector('#labelTrack')!.textContent = String(current + 1).padStart(2, '0');
  renderTracks();
}

async function loadTrack(index: number, autoplay = true) {
  if (switching) return;
  switching = true;
  const wasPlaying = !audio.paused || autoplay;
  tonearm.classList.add('lift');
  vinyl.classList.add('changing');
  await new Promise(r => setTimeout(r, 360));
  current = (index + tracks.length) % tracks.length;
  audio.src = audioPath(tracks[current].file);
  audio.load();
  updateMeta();
  await new Promise(r => setTimeout(r, 180));
  tonearm.classList.remove('lift');
  vinyl.classList.remove('changing');
  switching = false;
  if (wasPlaying) {
    try { await audio.play(); } catch { /* browser interaction may be required */ }
  }
}

function syncPlayState() {
  const playing = !audio.paused;
  vinyl.classList.toggle('playing', playing);
  tonearm.classList.toggle('down', playing);
  playBtn.textContent = playing ? 'Ⅱ' : '▶';
  document.body.classList.toggle('is-playing', playing);
}

playBtn.addEventListener('click', async () => {
  if (!audio.src) await loadTrack(current, false);
  if (audio.paused) await audio.play(); else audio.pause();
});
nextBtn.addEventListener('click', () => loadTrack(current + 1));
prevBtn.addEventListener('click', () => loadTrack(current - 1));
tracklist.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.track');
  if (btn) loadTrack(Number(btn.dataset.index));
});
audio.addEventListener('play', syncPlayState);
audio.addEventListener('pause', syncPlayState);
audio.addEventListener('ended', () => loadTrack(current + 1));
audio.addEventListener('loadedmetadata', () => document.querySelector('#duration')!.textContent = fmt(audio.duration));
volume.addEventListener('input', () => audio.volume = Number(volume.value));
seek.addEventListener('input', () => { if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration; });
audio.volume = 0.8;

function progressLoop() {
  if (audio.duration) {
    seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    document.querySelector('#currentTime')!.textContent = fmt(audio.currentTime);
    document.querySelector('#duration')!.textContent = fmt(audio.duration);
  }
  const bars = document.querySelectorAll<HTMLElement>('.vu i');
  bars.forEach((b, i) => b.style.transform = `scaleY(${audio.paused ? .15 : .2 + Math.abs(Math.sin(performance.now()/170 + i*0.9))*.8})`);
  raf = requestAnimationFrame(progressLoop);
}
raf = requestAnimationFrame(progressLoop);
window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
  if (e.code === 'ArrowRight') nextBtn.click();
  if (e.code === 'ArrowLeft') prevBtn.click();
});

// Phaser is used as a lightweight atmospheric FX layer: dust, sparks, scanner beam and reactive flashes.
class Backdrop extends Phaser.Scene {
  g!: Phaser.GameObjects.Graphics;
  dust: {x:number;y:number;s:number;a:number;v:number}[] = [];
  sparks: {x:number;y:number;vx:number;vy:number;life:number}[] = [];
  beam = 0;
  constructor() { super('Backdrop'); }
  create() {
    this.g = this.add.graphics();
    for (let i=0;i<90;i++) this.dust.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,s:.5+Math.random()*1.8,a:.04+Math.random()*.18,v:.08+Math.random()*.35});
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (Math.random() < .11) this.sparks.push({x:p.x,y:p.y,vx:(Math.random()-.5)*1.8,vy:-.4-Math.random()*1.5,life:1});
    });
  }
  update(_: number, delta: number) {
    const dt = delta / 16.7; this.g.clear();
    this.g.fillStyle(0xffffff, 1);
    for (const d of this.dust) {
      d.y -= d.v*dt; if (d.y < -5) { d.y = innerHeight+5; d.x = Math.random()*innerWidth; }
      this.g.fillStyle(0xffffff, d.a); this.g.fillCircle(d.x,d.y,d.s);
    }
    this.beam = (this.beam + .22*dt) % (innerHeight+220);
    this.g.fillStyle(0xffffff, .016); this.g.fillRect(0,this.beam-110,innerWidth,1);
    for (let i=this.sparks.length-1;i>=0;i--) {
      const s=this.sparks[i]; s.x+=s.vx*dt; s.y+=s.vy*dt; s.vy+=.04*dt; s.life-=.025*dt;
      this.g.fillStyle(0xffffff, Math.max(0,s.life*.35)); this.g.fillRect(s.x,s.y,1.5,1.5);
      if (s.life<=0) this.sparks.splice(i,1);
    }
  }
}

new Phaser.Game({
  type: Phaser.CANVAS,
  parent: 'phaser-bg',
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
  scene: Backdrop,
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  banner: false
});

renderTracks();
updateMeta();
