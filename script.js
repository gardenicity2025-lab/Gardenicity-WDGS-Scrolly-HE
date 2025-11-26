<script>
/* Hero timeline (using #hero-wrap):
   - Image fades by CSS (unchanged).
   - 0.00–0.60: Title fades in while the 3rd line baseline sits on the media baseline.
   - 0.60–1.00: Whole column slides so the last link baseline lands on the media baseline.
*/
(() => {
  const wrap  = document.getElementById('hero-wrap');   // the scroll "driver"
  const media = document.getElementById('hero-media');  // overlay with margins (96/82)
  const col   = document.getElementById('hero-col');    // moving column
  const title = document.getElementById('hero-title');  // <h1> with 3 .line spans
  const links = document.getElementById('hero-links');  // <nav> links
  if (!wrap || !media || !col || !title || !links) return;

  const root  = document.documentElement;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const easeInOutCubic = t => t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  // If you see a tiny baseline drift, nudge +/- px here:
  const BASELINE_NUDGE = 0;

  let startShift = 0; // align 3rd title line bottom to media bottom
  let endShift   = 0; // align LAST link bottom to media bottom

  function measure(){
    // neutralize transform to read true geometry
    const prev = col.style.transform;
    col.style.transform = 'translateY(0px)';

    const lines = title.querySelectorAll('.line');
    const third = lines[2] || lines[lines.length-1];
    const thirdRect = third.getBoundingClientRect();
    const lastLink  = links.lastElementChild || links;
    const lastRect  = lastLink.getBoundingClientRect();
    const mediaRect = media.getBoundingClientRect();

    const mediaBaseline = mediaRect.bottom + BASELINE_NUDGE;

    startShift = mediaBaseline - thirdRect.bottom;
    endShift   = mediaBaseline - lastRect.bottom;

    // prime CSS var for first paint
    col.style.transform = prev || '';
    root.style.setProperty('--shiftPx', startShift.toFixed(1) + 'px');
  }

  // Correct 0→1 progress for a "driver" taller than the viewport
  function progress(){
    const r  = wrap.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const total = r.height - vh;
    if (total <= 0) return 1;
    return clamp(-r.top / total, 0, 1);
  }

  function update(){
    const p = progress();

    // Step 2: slow, soft fade while parked on baseline (first 60%)
    const pFade = easeInOutCubic( clamp(p / 0.60, 0, 1) );
    root.style.setProperty('--titleOpacity', pFade.toFixed(3));

    // Step 3: slide + reveal links (last 40%)
    const pSlide = clamp((p - 0.60) / 0.40, 0, 1);
    const shift  = startShift + (endShift - startShift) * pSlide;
    root.style.setProperty('--shiftPx', shift.toFixed(1) + 'px');
    root.style.setProperty('--linksOpacity', pSlide.toFixed(3)); // fade links 0→1 during slide
  }

  async function init(){
    // wait for fonts so baselines are accurate
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch(e){}
    }
    measure(); update();
    window.addEventListener('resize', ()=>{ measure(); update(); });
    window.addEventListener('scroll', update, { passive:true });
  }

  init();
})();
</script>
