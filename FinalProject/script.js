// ── Annoying Volume — Rotary Dial Mechanic ────────────────────────────────────
// Drag a finger hole LEFT  → adds that number to volume
// Drag a finger hole RIGHT → subtracts that number from volume
// Release → confirms, dial snaps back like a real rotary phone

const MAX_VOLUME = 10;
const DIAL_CX    = 242;   // dial center x 
const DIAL_CY    = 270;   // dial center y 
const DRAG_THRESHOLD = 8; 

let volume = 0;

const volumeNumber  = document.getElementById('volumeNumber');
const volBarFill    = document.getElementById('volBarFill');
const volBarLabel   = document.getElementById('volBarLabel');
const statusMsg     = document.getElementById('statusMsg');
const dialGroup     = document.getElementById('dialGroup');
const volDisplay    = document.querySelector('.volume-display');
const phoneSvg      = document.getElementById('phoneSvg');

//User helpers
function updateUI() {
  const pct = Math.round((volume / MAX_VOLUME) * 100);
  volumeNumber.textContent = volume;
  volBarFill.style.width   = pct + '%';
  volBarLabel.textContent  = pct + '%';
  volBarFill.classList.toggle('danger', volume >= 8);
}

function setStatus(msg, type = '') {
  statusMsg.textContent = msg;
  statusMsg.className   = 'status-msg ' + type;
}

function popVolDisplay() {
  volDisplay.classList.remove('pop');
  void volDisplay.offsetWidth; 
  volDisplay.classList.add('pop');
}

function rotateDial(deg) {
  dialGroup.style.transform = `rotate(${deg}deg)`;
}

function snapBack() {
  dialGroup.classList.add('snap-back');
  rotateDial(0);
  dialGroup.addEventListener('transitionend', () => {
    dialGroup.classList.remove('snap-back');
  }, { once: true });
}

// Triple confirm for max volume, because why not be extra annoying?
function tripleConfirm() {
  if (!confirm('Are you SURE you want maximum volume?'))     { setStatus('Wise choice.', 'bad');                           return false; }
  if (!confirm('Like, REALLY sure? This is quite loud.'))   { setStatus('Changed your mind? Typical.', 'bad');            return false; }
  if (!confirm('Final warning. Ears may suffer. Proceed?')) { setStatus('Backing out at the last second. Classic.', 'bad'); return false; }
  return true;
}

// Convert client coords → SVG coords 
function clientToSVG(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

// ── Rotary drag logic 
function initRotaryDial() {
  const holes = document.querySelectorAll('.dial-hole');

  holes.forEach(hole => {
    hole.addEventListener('mousedown',  startDrag);
    hole.addEventListener('touchstart', startDrag, { passive: true });
  });

  function startDrag(e) {
    e.preventDefault?.();
    const touch    = e.touches?.[0] ?? e;
    const num      = parseInt(hole_num(e.currentTarget));
    const startX   = touch.clientX;
    const startY   = touch.clientY;
    const svg      = phoneSvg;
    let committed  = false;
    let direction  = null; // 'add' | 'subtract'
    let currentRot = 0;

    const holeEl = e.currentTarget;
    holeEl.classList.add('active');

    function onMove(ev) {
      const t   = ev.touches?.[0] ?? ev;
      const dx  = t.clientX - startX;

      // Rotate dial to follow drag (left = negative angle = adding)
      currentRot = Math.max(-60, Math.min(60, dx * 0.4));
      rotateDial(currentRot);

      if (!committed && Math.abs(dx) > DRAG_THRESHOLD) {
        committed = true;
        direction = dx < 0 ? 'add' : 'subtract';
      }

      if (committed) {
        holeEl.classList.remove('adding', 'subtracting', 'active');
        holeEl.classList.add(direction === 'add' ? 'adding' : 'subtracting');
        const preview = direction === 'add'
          ? Math.min(MAX_VOLUME, volume + num)
          : Math.max(0, volume - num);
        setStatus(
          direction === 'add'
            ? `← Pull left: +${num} → volume ${preview}`
            : `→ Push right: −${num} → volume ${preview}`,
          direction === 'add' ? 'good' : 'warn'
        );
      }
    }

    function onEnd() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onEnd);

      holeEl.classList.remove('active', 'adding', 'subtracting');
      snapBack();

      if (!committed) {
        setStatus('Drag left to add, right to subtract.', '');
        return;
      }

      if (direction === 'add') {
        const next = volume + num;
        if (next > MAX_VOLUME) {
          setStatus(`Can't go above ${MAX_VOLUME}!`, 'bad');
          return;
        }
        if (next === MAX_VOLUME) {
          if (!tripleConfirm()) return;
          phoneSvg.classList.add('ringing');
        }
        volume = next;
        setStatus(`+${num} → Volume is now ${volume} 🔊`, 'good');
      } else {
        const next = volume - num;
        if (next < 0) {
          setStatus(`Can't go below 0!`, 'bad');
          return;
        }
        volume = next;
        setStatus(`−${num} → Volume is now ${volume}`, 'warn');
        if (volume < MAX_VOLUME) phoneSvg.classList.remove('ringing');
      }

      updateUI();
      popVolDisplay();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onEnd);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend',  onEnd);
  }

  function hole_num(el) {
    return el.getAttribute('data-num');
  }
}

//  Init 
initRotaryDial();
updateUI();
setStatus('Drag a circle left to add volume, right to subtract.');