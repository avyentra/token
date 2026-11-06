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
  setTimeout(rings,400); setInterval(rings,1000);

  /* ---------- Typing headline (2 lines, like the original) ---------- */
  var lines = [
    { el: document.getElementById('typed1'), parts: [{t:"$AVYENTRA \u2014\u00a0", c:""},{t:"The World's First Web4 Token", c:"grad"}] },
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
  for(var k=-11;k<=11;k++){
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
  var svgNS = "http://www.w3.org/2000/svg";
  var segG = document.getElementById('donutSegs'), legend = document.getElementById('legend');
  var dVal = document.getElementById('dVal'), dLbl = document.getElementById('dLbl');
  var R = 84, C = 2*Math.PI*R, GAP = 1.2, acc = 0, segs = [], lh = "";
  function esc(s){ return s.replace(/&/g,'&amp;'); }
  TOK.forEach(function(t,i){
    var len = t[2]/100*C;
    var c = document.createElementNS(svgNS,'circle');
    c.setAttribute('cx',100); c.setAttribute('cy',100); c.setAttribute('r',R);
    c.setAttribute('fill','none'); c.setAttribute('stroke',t[3]); c.setAttribute('stroke-width',22);
    c.setAttribute('stroke-linecap','butt'); c.setAttribute('transform','rotate(-90 100 100)');
    c.setAttribute('class','seg');
    c.style.strokeDashoffset = -acc;
    c.style.strokeDasharray = '0 '+C;                       /* hidden until revealed */
    c.dataset.dash = Math.max(0,len-GAP)+' '+C;
    segG.appendChild(c); segs.push(c);
    acc += len;
    lh += '<li class="lg" data-i="'+i+'"><i style="background:'+t[3]+'"></i><span class="n"><b>'+esc(t[0])+'</b><span>'+t[1].toLocaleString('en-US')+' AVYENTRA</span></span><span class="pc">'+t[2].toFixed(2)+'%</span></li>';
  });
  legend.innerHTML = lh;
  var items = legend.children;
  function setActive(idx){
    segs.forEach(function(s,i){
      var on = idx === null || i === idx;
      s.style.opacity = on ? 1 : 0.25;
      s.setAttribute('stroke-width', idx !== null && i === idx ? 28 : 22);
      items[i].classList.toggle('hl', idx !== null && i === idx);
    });
    if(idx === null){ dVal.textContent = '11,000,000'; dLbl.textContent = 'TOTAL SUPPLY'; }
    else { dVal.textContent = TOK[idx][1].toLocaleString('en-US'); dLbl.textContent = TOK[idx][0].toUpperCase(); }
  }
  segs.forEach(function(s,i){
    s.addEventListener('mouseenter',function(){ setActive(i); });
    s.addEventListener('mouseleave',function(){ setActive(null); });
    s.addEventListener('click',function(){ setActive(i); });
  });
  Array.prototype.forEach.call(items,function(el,i){
    el.addEventListener('mouseenter',function(){ setActive(i); });
    el.addEventListener('mouseleave',function(){ setActive(null); });
    el.addEventListener('click',function(){ setActive(i); });
  });
  var donutDone = false;
  function playDonut(){
    if(donutDone) return; donutDone = true;
    segs.forEach(function(s,i){ setTimeout(function(){ s.style.strokeDasharray = s.dataset.dash; }, 120 + i*70); });
  }

  /* ---------- Roadmap ---------- */
  var PH = [
    ["01","PHASE 1","14 OCT – 14 NOV 2026","Presale Launch",["Presale Phase 1 launch","Marketing campaigns & community growth","Website, whitepaper & tokenomics updates"],"#22d3ee"],
    ["02","PHASE 2","15 NOV – 15 DEC 2026","Ecosystem Expansion",["Presale Phase 2","Strategic partnerships & KOL campaigns","Community engagement and launch preparations"],"#3b82f6"],
    ["03","PHASE 3","5 JANUARY 2027","Token Listing",["$AVYENTRA Listing","Liquidity provisioning & exchange listing plans","Community airdrop distribution as per schedule"],"#7c3aed"],
    ["04","PHASE 4","2027","Growth & Development",["Ecosystem development","Marketing expansion & community initiatives","Partnership announcements"],"#2dd4bf"],
    ["05","PHASE 5","FEB 2027","Web4 Expansion",["Explore Web4 utility integrations","Ecosystem collaborations","Holder engagement initiatives"],"#38bdf8"],
    ["06","PHASE 6","MAR 2027","Scaling & Optimization",["Platform improvements & utility expansion","Global community growth","Next-phase roadmap announcement"],"#a78bfa"]
  ];
  var tl = document.getElementById('timeline'), th = "";
  PH.forEach(function(p){
    th += '<div class="ph-row reveal"><span class="dot"></span><div class="phase" style="--c:'+p[5]+'"><span class="num">'+p[0]+'</span>'+
      '<div class="meta"><b>'+p[1]+'</b>'+p[2]+'</div><h3>'+p[3]+'</h3><ul>'+
      p[4].map(function(x){return '<li>'+x.replace('&','&amp;')+'</li>';}).join('')+'</ul></div></div>';
  });
  tl.insertAdjacentHTML('beforeend', th);
  var railFill = document.getElementById('railFill');
  function railProgress(){
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh*0.6 - r.top) / r.height));
    railFill.style.height = (p*100)+'%';
  }

  /* ---------- Scroll reveal + section triggers ---------- */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          if(e.target.classList.contains('donut-wrap')) playDonut();
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
})();
