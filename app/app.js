const data = window.SASHA_TRACK || {};
const qs = (s) => document.querySelector(s);

const title = qs('#trackTitle');
const subtitle = qs('#trackSubtitle');
const featuredLabel = qs('#featuredLabel');
const listenTitle = qs('#listenTitle');
const statement = qs('#statement');
const platformGrid = qs('#platformGrid');
const heroVideo = qs('#heroVideo');
const soundToggle = qs('#soundToggle');
const volumeDown = qs('#volumeDown');
const volumeUp = qs('#volumeUp');
const volumeValue = qs('#volumeValue');
const warmToggle = qs('#warmToggle');

let selectedVolume = 60;
let rememberedVolume = 60;
let warmEnabled = false;
let audioContext;
let sourceNode;
let lowShelf;
let highShelf;

function hydrateText(){
  document.title = `${data.artist || 'Sasha Persholja'} — ${data.title || 'Official App'}`;
  title.textContent = data.title || 'Sasha Persholja';
  subtitle.textContent = data.subtitle || '';
  featuredLabel.textContent = data.featuredLabel || 'FEATURED RELEASE';
  listenTitle.textContent = `Featured Release: ${data.title || ''}`;
  statement.textContent = data.statement || `Official music by ${data.artist || 'Sasha Persholja'}.`;

  const email = qs('#emailLink');
  const website = qs('#websiteLink');
  email.href = `mailto:${data.contactEmail || ''}`;
  email.textContent = `✉ ${data.contactEmail || 'Email'}`;
  website.href = data.website || '#';
  website.textContent = `◎ ${data.website ? data.website.replace(/^https?:\/\//,'').replace(/\/$/,'') : 'Official Website'}`;

  const socials = data.socials || {};
  qs('#instagramLink').href = socials.instagram || '#';
  qs('#youtubeLink').href = socials.youtube || '#';
  qs('#facebookLink').href = socials.facebook || '#';
}

function hydratePlatforms(){
  platformGrid.innerHTML = '';
  (data.platforms || []).forEach((platform) => {
    const a = document.createElement('a');
    a.className = `platform-card ${platform.id || ''}`;
    a.href = platform.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer external';
    a.innerHTML = `<strong>${platform.label}</strong><em>${platform.action || 'Listen'}</em><small>${platform.note || ''}</small>`;
    platformGrid.appendChild(a);
  });
}

function hydrateMedia(){
  const media = data.media || {};
  if (media.poster) heroVideo.poster = media.poster;
  if (media.video) {
    heroVideo.src = media.video;
    heroVideo.hidden = false;
    heroVideo.play().catch(() => {});
  }
}

function updateVolumeUI(){
  if (!heroVideo) return;
  heroVideo.volume = selectedVolume / 100;
  if (selectedVolume === 0) heroVideo.muted = true;
  volumeValue.textContent = `${selectedVolume}%`;
  const on = !heroVideo.muted && selectedVolume > 0;
  soundToggle.textContent = on ? '🔊 Song On' : '🔇 Song Off';
  soundToggle.setAttribute('aria-pressed', String(on));
}

function ensureAudioGraph(){
  if (!heroVideo || !heroVideo.src) return false;
  if (audioContext) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    audioContext = new AC();
    sourceNode = audioContext.createMediaElementSource(heroVideo);
    lowShelf = audioContext.createBiquadFilter();
    highShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 150;
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 5000;
    sourceNode.connect(lowShelf).connect(highShelf).connect(audioContext.destination);
    return true;
  } catch (_) {
    return false;
  }
}

soundToggle.addEventListener('click', () => {
  if (!heroVideo.src) return;
  if (heroVideo.muted || selectedVolume === 0) {
    selectedVolume = rememberedVolume || 60;
    heroVideo.muted = false;
    heroVideo.play().catch(() => {});
  } else {
    rememberedVolume = selectedVolume || rememberedVolume;
    heroVideo.muted = true;
  }
  updateVolumeUI();
});

volumeDown.addEventListener('click', () => {
  selectedVolume = Math.max(0, selectedVolume - 10);
  if (selectedVolume > 0) rememberedVolume = selectedVolume;
  updateVolumeUI();
});

volumeUp.addEventListener('click', () => {
  selectedVolume = Math.min(100, selectedVolume + 10);
  if (selectedVolume > 0) rememberedVolume = selectedVolume;
  heroVideo.muted = false;
  updateVolumeUI();
});

warmToggle.addEventListener('click', async () => {
  if (!ensureAudioGraph()) return;
  if (audioContext.state === 'suspended') await audioContext.resume();
  warmEnabled = !warmEnabled;
  const now = audioContext.currentTime;
  lowShelf.gain.setTargetAtTime(warmEnabled ? 2 : 0, now, 0.015);
  highShelf.gain.setTargetAtTime(warmEnabled ? -2 : 0, now, 0.015);
  warmToggle.textContent = warmEnabled ? 'Warm On' : 'Warm Off';
  warmToggle.setAttribute('aria-pressed', String(warmEnabled));
});

hydrateText();
hydratePlatforms();
hydrateMedia();
updateVolumeUI();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
