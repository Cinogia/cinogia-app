// bravo.js — interactions for bravo.html
// Features implemented:
// - Responsive nav toggle
// - Parallax layers (mouse + scroll)
// - Mouse light effect
// - Reveal on scroll (IntersectionObserver)
// - 3D tilt cards (pointer interaction)
// - Simple phone mockup parallax
// - Small form stub (no network)

(function(){
  'use strict';

  // Helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // NAV TOGGLE
  function navSetup(){
    const toggle = document.querySelector('.nav-toggle');
    if(!toggle) return;
    toggle.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('nav-open');
    });
  }

  // SMOOTH PARALLAX (mouse + scroll)
  // Elements that should respond have attribute data-depth or class .parallax
  function parallaxSetup(){
    const parallaxEls = $$('[data-depth], .parallax');
    if(!parallaxEls.length) return;

    // track mouse normalization in range [-1,1]
    let mouseX = 0, mouseY = 0;
    let ww = window.innerWidth, wh = window.innerHeight;

    window.addEventListener('resize', ()=>{ ww = window.innerWidth; wh = window.innerHeight });

    window.addEventListener('mousemove', e=>{
      mouseX = (e.clientX / ww) * 2 - 1;
      mouseY = (e.clientY / wh) * 2 - 1;
    });

    // subtle parallax on scroll based on element depth
    function applyParallax(){
      const scrollY = window.scrollY || window.pageYOffset;

      parallaxEls.forEach(el=>{
        const depth = parseFloat(el.getAttribute('data-depth')) || 0.06;
        // mouse-based offset
        const offsetX = mouseX * depth * 30; // multiplier
        const offsetY = mouseY * depth * 24 + scrollY * depth * 0.12;
        // use transform for GPU
        el.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });

      requestAnimationFrame(applyParallax);
    }

    requestAnimationFrame(applyParallax);
  }

  // MOUSE LIGHT FOLLOWER
  function mouseLightSetup(){
    const light = document.getElementById('mouse-light');
    if(!light) return;

    let lastMove = 0;
    let visible = false;

    window.addEventListener('mousemove', e=>{
      lastMove = Date.now();
      visible = true;
      light.style.opacity = '1';
      // position with a small offset so it feels like a glow above cursor
      const x = e.clientX, y = e.clientY;
      light.style.left = x + 'px';
      light.style.top = y + 'px';
      // dynamic size depending on viewport
      light.style.width = Math.max(140, Math.min(320, window.innerWidth * 0.18)) + 'px';
      light.style.height = light.style.width;
      // subtle background using CSS radial-gradient via style
      light.style.background = `radial-gradient(circle at 30% 30%, rgba(255,90,31,0.18), rgba(255,90,31,0.06) 30%, rgba(255,90,31,0.03) 60%, transparent 80%)`;
    });

    // fade out loop if mouse stops
    setInterval(()=>{
      if(!visible) return;
      if(Date.now() - lastMove > 900){
        visible = false;
        light.style.opacity = '0';
      }
    }, 300);
  }

  // REVEAL ON SCROLL
  function revealSetup(){
    const items = $$('.reveal');
    if(!items.length) return;

    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(ent=>{
        if(ent.isIntersecting){
          ent.target.classList.add('visible');
          // once visible, optionally unobserve to save work
          obs.unobserve(ent.target);
        }
      });
    }, {threshold: 0.12});

    items.forEach(i=>obs.observe(i));
  }

  // 3D TILT CARDS
  function tiltSetup(){
    // Targets: .three-card-inner and elements with .tilt-target
    const tiltEls = $$('.three-card-inner, .tilt-target');
    if(!tiltEls.length) return;

    tiltEls.forEach(el=>{
      let rect = null;

      function updateRect(){ rect = el.getBoundingClientRect(); }
      updateRect();
      window.addEventListener('resize', updateRect);

      el.addEventListener('pointerenter', ()=> el.style.transition = 'transform .18s cubic-bezier(.2,.9,.25,1)');
      el.addEventListener('pointerleave', ()=> el.style.transition = 'transform .5s cubic-bezier(.18,.85,.32,1)');

      el.addEventListener('pointermove', (ev)=>{
        if(!rect) updateRect();
        const px = (ev.clientX - rect.left) / rect.width; // 0..1
        const py = (ev.clientY - rect.top) / rect.height; // 0..1
        // rotate range
        const rx = (py - 0.5) * -12; // tilt up/down
        const ry = (px - 0.5) * 18;  // tilt left/right
        // scale slightly when hovered
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      });

      el.addEventListener('pointerout', ()=>{
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      });
    });
  }

  // PHONE MOCKUP PARALLAX (more pronounced) - inside hero
  function phoneParallaxSetup(){
    const phone = document.querySelector('.hero-phone');
    if(!phone) return;
    const layers = Array.from(phone.querySelectorAll('[data-depth], .parallax'));
    if(!layers.length) return;

    let rect = phone.getBoundingClientRect();
    window.addEventListener('resize', ()=> rect = phone.getBoundingClientRect());

    phone.addEventListener('mousemove', ev=>{
      const px = (ev.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const py = (ev.clientY - rect.top) / rect.height - 0.5;

      layers.forEach((layer, i)=>{
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0.12;
        const tx = px * depth * 40; // bigger
        const ty = py * depth * 30;
        layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${py*6}deg)`;
      });
    });

    phone.addEventListener('mouseleave', ()=>{
      layers.forEach(l=> l.style.transform = 'translate3d(0,0,0)');
    });
  }

  // FAKE FORM SUBMIT HANDLER (progressive enhancement)
  function formSetup(){
    const form = document.querySelector('.contact-form');
    if(!form) return;
    form.addEventListener('submit', e=>{
      e.preventDefault();
      // small friendly UI feedback
      const btn = form.querySelector('button[type="submit"]');
      const txt = btn ? btn.textContent : null;
      if(btn) btn.textContent = 'Enviando...';
      // simulate small delay
      setTimeout(()=>{
        if(btn) btn.textContent = txt;
        // show polite confirmation
        // We'll use an accessible alert region if present, else fallback to alert()
        let region = document.querySelector('#contact .form-feedback');
        if(!region){
          region = document.createElement('div');
          region.className = 'form-feedback';
          region.setAttribute('role','status');
          region.style.marginTop = '12px';
          region.textContent = 'Mensagem enviada — obrigado! Entraremos em contato em até 48h.';
          form.appendChild(region);
        } else { region.textContent = 'Mensagem enviada — obrigado!'; }
        form.reset();
      }, 800);
    });
  }

  // LAZY LOAD IMAGES (basic)
  function lazyImages(){
    const imgs = Array.from(document.querySelectorAll('img'));
    if('loading' in HTMLImageElement.prototype){
      imgs.forEach(img=> img.loading = 'lazy');
    } else {
      // fallback: observer
      const obs = new IntersectionObserver((entries, o)=>{
        entries.forEach(ent=>{
          if(ent.isIntersecting){
            const i = ent.target;
            if(i.dataset && i.dataset.src){ i.src = i.dataset.src }
            o.unobserve(i);
          }
        });
      });
      imgs.forEach(img=> obs.observe(img));
    }
  }

  // small accessibility helper: add focus-visible class
  function focusVisiblePolish(){
    document.addEventListener('keydown', function(e){
      if(e.key === 'Tab') document.documentElement.classList.add('show-focus');
    });
  }

  // Initialize everything
  function init(){
    navSetup();
    parallaxSetup();
    mouseLightSetup();
    revealSetup();
    tiltSetup();
    phoneParallaxSetup();
    formSetup();
    lazyImages();
    focusVisiblePolish();

    // minor perf: reduce transforms on scroll for parallax elements that are far off
    // no-op here but reserved for future

    // Fire initial reveal check for above-the-fold elements
    document.querySelectorAll('.reveal').forEach(el=>{
      if(el.getBoundingClientRect().top < window.innerHeight * 0.9){
        el.classList.add('visible');
      }
    });
  }

  // Wait for DOMContentLoaded then init
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
