(function(){
  "use strict";

  /* ---------- Countdown (Bitget listing) ---------- */
  var TARGET = Date.UTC(2027,0,5,11,0,0);
  var cds = document.querySelectorAll('[data-countdown]');
  function pad(n){return String(n).padStart(2,'0');}
  function tick(){
    var diff = Math.max(0, TARGET - Date.now());
    var d = Math.floor(diff/864e5), h = Math.floor(diff/36e5)%24, m = Math.floor(diff/6e4)%60, s = Math.floor(diff/1e3)%60;
    cds.forEach(function(c){
      [['d',d],['h',h],['m',m],['s',s]].forEach(function(p){
        var el = c.querySelector('[data-'+p[0]+']'), v = pad(p[1]);
        if(el.textContent !== v){
          el.textContent = v;
          if(c.classList.contains('tb-cd') || c.hasAttribute('data-rings')){ el.classList.remove('tickin'); void el.offsetWidth; el.classList.add('tickin'); }
        }
      });
    });
  }
  /* ring progress + presale→listing bar for the hero countdown */
  var START = Date.UTC(2026,9,15,0,0,0), RC = 2*Math.PI*31;
  var MAXD = Math.ceil((TARGET-START)/864e5);
  function rings(){
    var diff = Math.max(0, TARGET - Date.now());
    var v = { d: Math.floor(diff/864e5)/MAXD, h: (Math.floor(diff/36e5)%24)/24, m: (Math.floor(diff/6e4)%60)/60, s: (Math.floor(diff/1e3)%60)/60 };
    document.querySelectorAll('[data-ring]').forEach(function(r){
      r.style.strokeDashoffset = (RC * (1 - v[r.dataset.ring])).toFixed(2);
    });
    var pct = Math.min(100, Math.max(0, (Date.now()-START)/(TARGET-START)*100));
    var bar = document.getElementById('cdBar'), lbl = document.getElementById('cdPct');
    if(bar){ bar.style.width = pct.toFixed(1)+'%'; lbl.textContent = pct.toFixed(1)+'%'; }
  }
  tick(); setInterval(tick,1000);

  /* ---------- Hero launch timeline (Phase 1 -> Phase 2 -> Listing) ---------- */
  (function(){
    var fill = document.getElementById('hzFill'), now = document.getElementById('hzNow');
    if(!fill) return;
    var P1 = Date.UTC(2026,9,15), P2 = Date.UTC(2026,10,15), LST = TARGET;
    function pos(t){            /* three equal segments: P1..P2, P2..LST, then listed */
      if(t <= P1) return 0;
      if(t <= P2) return (t-P1)/(P2-P1) * 33.333 + 12.5;
      if(t <= LST) return 45.833 + (t-P2)/(LST-P2) * 33.333;
      return 100;
    }
    var p = Math.min(100, Math.max(12.5, pos(Date.now())));
    setTimeout(function(){ fill.style.width = p + '%'; now.style.left = p + '%'; }, 500);
  })();
  /* ---------- Hero coin tilt ---------- */
  (function(){
    var tw = document.getElementById('hzTilt'), hero = document.getElementById('top');
    if(!tw || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var tx=0, ty=0, cx=0, cy=0, on=false, t0=performance.now();
    hero.addEventListener('pointermove',function(e){
      var r = tw.getBoundingClientRect();
      tx = Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(window.innerWidth/2)));
      ty = Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(window.innerHeight/1.5)));
      on = true;
    });
    hero.addEventListener('pointerleave',function(){ on=false; });
    (function loop(now){
      if(!on){ var k=(now-t0)/1000; tx=Math.sin(k*.5)*.35; ty=Math.cos(k*.4)*.2; }
      cx += (tx-cx)*.06; cy += (ty-cy)*.06;
      tw.style.transform = 'perspective(1000px) rotateY('+(cx*18).toFixed(2)+'deg) rotateX('+(-cy*14).toFixed(2)+'deg)';
      requestAnimationFrame(loop);
    })(t0);
  })();

  setTimeout(rings,400); setInterval(rings,1000);

  /* ---------- Typing headline (2 lines, like the original) ---------- */
  var lines = [
    { el: document.getElementById('typed1'), parts: [{t:"$MGL \u2014\u00a0", c:""},{t:"The World's First Web4 Token", c:"grad"}] },
    { el: document.getElementById('typed2'), parts: [{t:"on BNB Smart Chain (BSC)", c:""}] }
  ];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lineLen(l){ return l.parts.reduce(function(a,p){return a+p.t.length;},0); }
  function renderLine(l, count, cursor){
    var html = "", left = count;
    l.parts.forEach(function(p){
      if(left<=0) return;
      var s = p.t.slice(0,left); left -= p.t.length;
      s = s.replace(/&/g,"&amp;").replace(/</g,"&lt;");
      html += p.c ? '<span class="'+p.c+'">'+s+'</span>' : s;
    });
    l.el.innerHTML = html + (cursor ? '<span class="typing-cursor"></span>' : '');
  }
  if(reduce){
    renderLine(lines[0], lineLen(lines[0]), false);
    renderLine(lines[1], lineLen(lines[1]), true);
  } else {
    var li = 0, ci = 0;
    renderLine(lines[0], 0, true);
    setTimeout(function step(){
      var L = lines[li];
      ci++;
      renderLine(L, ci, true);
      if(ci >= lineLen(L)){
        if(li < lines.length-1){ renderLine(L, ci, false); li++; ci = 0; renderLine(lines[li], 0, true); setTimeout(step, 260); return; }
        return; /* done – cursor keeps blinking at the end */
      }
      setTimeout(step, 38 + Math.random()*30);
    }, 500);
  }

  /* ---------- Nav: scrolled state, active link, mobile menu ---------- */
  var nav = document.getElementById('nav'), toTop = document.getElementById('toTop');
  var links = document.querySelectorAll('.nav-links a');
  var secs = ['about','ecosystem','presale','tokenomics','roadmap','resources'].map(function(id){return document.getElementById(id);});
  function onScroll(){
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
    var cur = null;
    secs.forEach(function(s){ if(s.getBoundingClientRect().top < 140) cur = s.id; });
    links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+cur); });
    railProgress();
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  document.getElementById('burger').addEventListener('click', function(){ nav.classList.toggle('open'); });
  document.querySelectorAll('.mobile-menu a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); }); });

  /* ---------- 3D coin thickness ---------- */
  var rotor = document.getElementById('rotor');
  if(rotor) for(var k=-11;k<=11;k++){
    var l = document.createElement('div');
    l.className = 'coin-layer';
    l.style.transform = 'translateZ('+k+'px)';
    l.style.filter = 'brightness('+(0.7 + Math.abs(k)/30)+')';
    rotor.insertBefore(l, rotor.firstChild);
  }

  /* ---------- Partners marquee ---------- */
  var partners = [
    ["Bitget","OFFICIAL LISTING","bitget.svg"],
    ["CoinMarketCap","LISTED","cmc.svg"],
    ["CoinGecko","TRACKED","coingecko.png"],
    ["BNB Smart Chain","NETWORK","bsc.svg"],
    ["CertiK","SECURITY","certik.svg"],
    ["Gate.io","EXCHANGE","gateio.svg"]
  ];
  var mq = document.getElementById('marquee'), mh = "";
  for(var r=0;r<2;r++) partners.forEach(function(p){
    mh += '<div class="p-card"'+(r?' aria-hidden="true"':'')+'><span class="p-logo"><img src="assets/partners/'+p[2]+'" alt="'+p[0]+' logo" loading="lazy"></span><div><b>'+p[0]+'</b><span>'+p[1]+'</span></div></div>';
  });
  mq.innerHTML = mh;

  /* ---------- AI calling bars + exchange candles ---------- */
  var bars = document.getElementById('bars'), bh = "";
  for(var b=0;b<15;b++){
    var x = 100 + b*8.5, hgt = 14 + Math.round(Math.abs(Math.sin(b*1.3))*22);
    var col = b%3===0 ? '#a78bfa' : (b%3===1 ? '#22d3ee' : '#67e8f9');
    bh += '<rect class="eco-anim eco-bar" x="'+x+'" y="'+(158-hgt)+'" width="4" height="'+hgt+'" rx="2" fill="'+col+'" style="animation-delay:'+(b*0.09).toFixed(2)+'s"/>';
  }
  bars.innerHTML = bh;
  var candles = document.getElementById('candles'), ch = "";
  var cdata = [[40,142,24,1],[74,124,30,0],[108,130,22,1],[142,100,34,1],[176,110,20,0],[210,78,34,1],[244,88,26,0],[278,52,36,1]];
  cdata.forEach(function(c,i){
    var col = c[3] ? '#34d399' : '#f472b6';
    ch += '<g class="eco-anim eco-candle" style="animation-delay:'+(i*0.3)+'s"><line x1="'+(c[0]+5)+'" y1="'+(c[1]-10)+'" x2="'+(c[0]+5)+'" y2="'+(c[1]+c[2]+10)+'" stroke="'+col+'" stroke-width="1.5"/><rect x="'+c[0]+'" y="'+c[1]+'" width="10" height="'+c[2]+'" rx="2" fill="'+col+'"/></g>';
  });
  candles.innerHTML = ch;

  /* ---------- Tokenomics donut ---------- */
  var TOK = [
    ["Public (P&L Main)",5000000,45.46,"#00E5FF"],
    ["Ecosystem",2200000,20.00,"#2563EB"],
    ["Marketing & Dev",880000,8.00,"#7C3AED"],
    ["Owner & Team",770000,7.00,"#38BDF8"],
    ["Public Reserve",550000,5.00,"#34D399"],
    ["Strategic Partnership",550000,5.00,"#A78BFA"],
    ["OTC",440000,4.00,"#F472B6"],
    ["Private Sale 1",250000,2.27,"#60A5FA"],
    ["Private Sale 2",250000,2.27,"#818CF8"],
    ["Community & Airdrops",110000,1.00,"#2DD4BF"]
  ];
  var rack = document.getElementById('tlRack'), info = document.getElementById('tlInfo');
  function esc(s){ return s.replace(/&/g,'&amp;'); }
  var rh = '';
  TOK.forEach(function(t,i){
    var fill = Math.max(4, t[2]/50*100);
    var bub = ''; for(var k=0;k<4;k++) bub += '<em style="--bx:'+(15+k*20)+'%;--bd:'+(2.4+((i+k)%4)*0.7)+'s;--bdl:'+(-(k*0.9+i*0.3))+'s"></em>';
    rh += '<button class="tl-tube" type="button" data-i="'+i+'" style="--c:'+t[3]+';--f:'+fill+'%;--d:'+(i*90)+'ms" aria-label="'+esc(t[0])+' '+t[2].toFixed(2)+'%">'+
      '<span class="tl-pc">'+t[2].toFixed(2)+'<small>%</small></span>'+
      '<span class="tl-glass"><span class="tl-liq"><i class="w1"></i><i class="w2"></i>'+bub+'</span></span>'+
      '<span class="tl-name">'+esc(t[0])+'</span><span class="tl-amt">'+t[1].toLocaleString('en-US')+'</span></button>';
  });
  rack.innerHTML = rh;
  var tubes = rack.children;
  function setActive(idx){
    for(var i=0;i<tubes.length;i++){ tubes[i].classList.toggle('dim', idx!==null && i!==idx); tubes[i].classList.toggle('on', i===idx); }
    if(idx===null){ info.innerHTML = '<span class="tl-hint">Hover or tap a tube to explore the allocation</span>'; return; }
    var t = TOK[idx];
    info.innerHTML = '<i style="background:'+t[3]+';box-shadow:0 0 12px '+t[3]+'"></i><b>'+esc(t[0])+'</b><span>'+t[1].toLocaleString('en-US')+' MGL</span><em style="color:'+t[3]+'">'+t[2].toFixed(2)+'%</em>';
  }
  setActive(null);
  Array.prototype.forEach.call(tubes,function(el){
    var i = +el.dataset.i;
    el.addEventListener('mouseenter',function(){ setActive(i); });
    el.addEventListener('mouseleave',function(){ setActive(null); });
    el.addEventListener('focus',function(){ setActive(i); });
    el.addEventListener('blur',function(){ setActive(null); });
    el.addEventListener('click',function(){ setActive(i); });
  });
  var donutDone = false;
  function playDonut(){
    if(donutDone) return; donutDone = true;
    rack.classList.add('go');
    var tot = document.getElementById('tkTotal'), N = 11000000, t0 = null;
    function step(ts){ if(!t0) t0 = ts; var p = Math.min(1,(ts-t0)/1600), v = Math.round(N*(1-Math.pow(1-p,3)));
      tot.textContent = v.toLocaleString('en-US'); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* ---------- Roadmap ---------- */
  var PH = [
    ["01","PHASE 1","14 OCT – 14 NOV 2026","Presale Launch",["Presale Phase 1 launch","Marketing campaigns & community growth","Website, whitepaper & tokenomics updates"],"#22d3ee"],
    ["02","PHASE 2","15 NOV – 15 DEC 2026","Ecosystem Expansion",["Presale Phase 2","Strategic partnerships & KOL campaigns","Community engagement and launch preparations"],"#3b82f6"],
    ["03","PHASE 3","5 JANUARY 2027","Token Listing",["$MGL Listing","Liquidity provisioning & exchange listing plans","Community airdrop distribution as per schedule"],"#7c3aed"],
    ["04","PHASE 4","2027","Growth & Development",["Ecosystem development","Marketing expansion & community initiatives","Partnership announcements"],"#2dd4bf"],
    ["05","PHASE 5","FEB 2027","Web4 Expansion",["Explore Web4 utility integrations","Ecosystem collaborations","Holder engagement initiatives"],"#38bdf8"],
    ["06","PHASE 6","MAR 2027","Scaling & Optimization",["Platform improvements & utility expansion","Global community growth","Next-phase roadmap announcement"],"#a78bfa"]
  ];
  /* phase start dates (UTC) used to work out Live / Up next / Upcoming */
  var PSTART = [Date.UTC(2026,9,14), Date.UTC(2026,10,15), Date.UTC(2027,0,5), Date.UTC(2027,0,6), Date.UTC(2027,1,1), Date.UTC(2027,2,1)];
  var NOW = Date.now(), live = 0;
  PSTART.forEach(function(t,i){ if(NOW >= t) live = i; });
  var liveEnd = PSTART[live+1] || (PSTART[live] + 31*864e5);
  var liveProg = Math.min(1, Math.max(0, (NOW - PSTART[live]) / (liveEnd - PSTART[live])));
  function amp(x){ return x.replace(/&/g,'&amp;'); }
  function cap(x){ return x.charAt(0) + x.slice(1).toLowerCase(); }
  var CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var ICO = [
    '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M9 18c-.8-2.6-.2-5 1.5-7.5C13 7 17 4.5 21 3c-1.5 4-4 8-7.5 10.5C11 15.2 8.6 15.8 6 15"/><circle cx="15" cy="9" r="1.6"/>',
    '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5 6.5 17M12 11.5l5.5 5.5"/>',
    '<path d="M3 20h18"/><path d="M6 16V9M11 16V5M16 16v-5"/><path d="m14 7 3-3 3 3"/>',
    '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'
  ];
  var daysLeft = Math.max(0, Math.ceil((liveEnd - NOW) / 864e5));
  var listEl = document.getElementById('rxList'), panel = document.getElementById('rxPanel'), lh = '';
  var STAT = PH.map(function(p,i){ return i < live ? 'done' : i === live ? 'live' : i === live+1 ? 'next' : 'up'; });
  var BADGE = {done:'<span class="rm-bd done">Completed</span>', live:'<span class="rm-bd live"><i></i>Live now</span>', next:'<span class="rm-bd next">Up next</span>', up:'<span class="rm-bd">Upcoming</span>'};
  PH.forEach(function(p,i){
    lh += '<button class="rx-item '+STAT[i]+'" type="button" role="tab" data-i="'+i+'" style="--c:'+p[5]+'">'+
      '<span class="rx-dot">'+(STAT[i]==='done'?CHK:p[0])+'</span>'+
      '<span class="rx-txt"><b>'+amp(p[3])+'</b><em>'+cap(p[1])+' · '+p[2]+'</em></span>'+
      (STAT[i]==='live'?'<span class="rx-live"><i></i>Live</span>':'')+
      '<svg class="rx-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>';
  });
  listEl.insertAdjacentHTML('beforeend', lh);
  var items = listEl.querySelectorAll('.rx-item'), cur = -1;
  function render(i){
    if(i === cur) return; cur = i;
    var p = PH[i], st = STAT[i], extra = '';
    if(st === 'live'){
      extra = '<div class="rx-stats"><div><b>'+daysLeft+'</b><span>days left in this phase</span></div><div><b>'+Math.round(liveProg*100)+'%</b><span>phase complete</span></div></div>'+
        '<div class="rx-bar"><i style="width:'+(liveProg*100).toFixed(1)+'%"></i></div>';
    } else if(st === 'done'){
      extra = '<div class="rx-stats one"><div><b>'+CHK+'</b><span>This phase is complete</span></div></div>';
    } else {
      var d = Math.max(0, Math.ceil((PSTART[i] - NOW)/864e5));
      extra = '<div class="rx-stats one"><div><b>'+d+'</b><span>days until this phase begins</span></div></div>';
    }
    panel.style.setProperty('--c', p[5]);
    panel.innerHTML = '<div class="rx-in">'+
      '<span class="rx-big" aria-hidden="true">'+p[0]+'</span>'+
      '<div class="rx-top"><span class="rx-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+ICO[i]+'</svg></span>'+BADGE[st]+'</div>'+
      '<div class="rx-dt">'+p[1]+' · '+p[2]+'</div><h3>'+amp(p[3])+'</h3>'+
      '<ul>'+p[4].map(function(x,k){ return '<li style="--k:'+k+'">'+CHK+'<span>'+amp(x)+'</span></li>'; }).join('')+'</ul>'+
      extra+
      '<div class="rx-nav"><button type="button" class="rx-prev" aria-label="Previous phase"'+(i===0?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>'+
      '<span><b>'+p[0]+'</b> / 0'+PH.length+'</span>'+
      '<button type="button" class="rx-next" aria-label="Next phase"'+(i===PH.length-1?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button></div>'+
      '</div>';
    items.forEach(function(el,k){ el.classList.toggle('on', k===i); el.setAttribute('aria-selected', k===i); });
    panel.querySelector('.rx-prev').onclick = function(){ if(cur>0) render(cur-1); };
    panel.querySelector('.rx-next').onclick = function(){ if(cur<PH.length-1) render(cur+1); };
    var sel = items[i]; if(window.innerWidth < 900 && sel.scrollIntoView) listEl.scrollTo({left: sel.offsetLeft - 16, behavior:'smooth'});
  }
  items.forEach(function(el){ el.addEventListener('click', function(){ render(+el.dataset.i); }); });
  render(live);
  var rxFill = document.getElementById('rxFill');
  function railProgress(){}
  setTimeout(function(){ rxFill.style.height = ((live + liveProg) / (PH.length-1) * 100).toFixed(2) + '%'; }, 600);

  /* ---------- Scroll reveal + section triggers ---------- */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          if(e.target.classList.contains('tk-play')) playDonut();
          io.unobserve(e.target);
        }
      });
    },{threshold:.14, rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

    /* pause ecosystem animations when off-screen */
    var eco = document.getElementById('ecoGrid');
    new IntersectionObserver(function(en){ eco.classList.toggle('eco-paused', !en[0].isIntersecting); }).observe(eco);
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
    playDonut();
  }

  document.getElementById('yr').textContent = new Date().getFullYear();
  onScroll();

  /* ---------- Source-view deterrent ----------
     Blocks Ctrl+U (view source), Ctrl+S (save), Ctrl+Shift+I/J/C and F12 (dev tools),
     and the right-click menu. Note: this only discourages casual copying;
     it cannot fully hide front-end code from a determined user. */
  document.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if(k === 'f12' ||
       (mod && (k === 'u' || k === 's' || k === 'p' || k === 'c' || k === 'x' || k === 'a')) ||
       (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
       (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u'))){
      e.preventDefault(); e.stopPropagation(); return false;
    }
  }, true);
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  ['copy','cut','selectstart'].forEach(function(ev){
    document.addEventListener(ev, function(e){
      var t = e.target;
      if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      if(ev !== 'selectstart' && e.clipboardData){ try{ e.clipboardData.setData('text/plain',''); }catch(_){} }
    });
  });
  document.addEventListener('dragstart', function(e){ if(e.target.tagName === 'IMG') e.preventDefault(); });

  /* plain "#" links: don't jump to top */
  document.querySelectorAll('a[href="#"]').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); });
  });

  /* ---------- Screenshot deterrent ----------
     A website cannot fully block OS screenshots; this hides the page
     whenever a screenshot shortcut is pressed or the window loses focus
     (e.g. Snipping Tool / Win+Shift+S overlay), and wipes the clipboard
     after the PrintScreen key. */
  (function(){
    var shield = document.createElement('div');
    shield.className = 'ss-shield';
    shield.innerHTML = '<div><b>Screenshots are disabled</b><span>Content of this site is protected.</span></div>';
    document.body.appendChild(shield);
    var timer;
    function hide(ms){
      document.documentElement.classList.add('ss-hide');
      clearTimeout(timer);
      if(ms) timer = setTimeout(show, ms);
    }
    function show(){ document.documentElement.classList.remove('ss-hide'); }
    function wipe(){ try{ if(navigator.clipboard) navigator.clipboard.writeText('').catch(function(){}); }catch(e){} }
    document.addEventListener('keydown', function(e){
      var k = e.key || '';
      if(k === 'PrintScreen' || e.keyCode === 44){ hide(1500); wipe(); }
      if((e.metaKey || e.ctrlKey) && e.shiftKey && /^[345sS]$/.test(k)){ hide(2500); }   /* Mac Cmd+Shift+3/4/5, Win+Shift+S, Firefox Ctrl+Shift+S */
      if(e.key === 'Meta' || e.key === 'OS'){ hide(0); }
    }, true);
    document.addEventListener('keyup', function(e){
      if(e.key === 'PrintScreen' || e.keyCode === 44){ wipe(); hide(1500); }
      if(e.key === 'Meta' || e.key === 'OS'){ setTimeout(show, 600); }
    }, true);
    window.addEventListener('blur', function(){ hide(0); });
    window.addEventListener('focus', function(){ setTimeout(show, 150); });
    document.addEventListener('visibilitychange', function(){ if(document.hidden) hide(0); else setTimeout(show, 150); });
  })();
})();
