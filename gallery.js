/* Five project emblems cut from the same stack of polished fins. */
(() => {
  const tau = Math.PI * 2;
  function emblem(kind) {
    const path = new Path2D();
    function circle(x, y, radius) {
      path.moveTo(x + radius, y);
      path.arc(x, y, radius, 0, tau);
      path.closePath();
    }
    switch (kind) {
      case 'calotrack':
        circle(0, 0, 1);
        for (let i = 0; i < 8; i++) {
          const a = i*tau/8+.075, b = (i+1)*tau/8-.075;
          path.moveTo(.81*Math.cos(a), .81*Math.sin(a));
          path.arc(0,0,.81,a,b);
          path.arc(0,0,.2,b,a,true);
          path.closePath();
        }
        break;
      case 'nearlee':
        path.moveTo(0,1.1);
        path.bezierCurveTo(-.23,.76,-.94,.12,-.92,-.35);
        path.bezierCurveTo(-.9,-1.39,.88,-1.39,.92,-.35);
        path.bezierCurveTo(.96,.12,.23,.77,0,1.1);
        path.closePath();
        circle(0,-.38,.36);
        break;
      case 'shop':
        path.moveTo(-.86,-.45);
        path.lineTo(-.48,-.45);
        path.bezierCurveTo(-.48,-1.4,.48,-1.4,.48,-.45);
        path.lineTo(.86,-.45); path.lineTo(1,.94); path.lineTo(-1,.94);
        path.closePath();
        path.moveTo(-.28,-.45); path.bezierCurveTo(-.28,-1.12,.28,-1.12,.28,-.45); path.closePath();
        path.rect(-.52,.12,1.04,.11);
        break;
      case 'task-tracker':
        path.moveTo(-1,-.03); path.lineTo(-.63,-.4); path.lineTo(-.21,.02);
        path.lineTo(.68,-.94); path.lineTo(1.08,-.57); path.lineTo(-.19,.89);
        path.closePath();
        break;
      case 'archive': {
        // Separated, bevel-like pixels echo the project's colour-detection study.
        const cells = ['01110','11011','10001','11011','01110'];
        cells.forEach((row, y) => [...row].forEach((cell,x) => {
          if (cell === '1') path.rect((x-2.5)*.39,(y-2.5)*.39,.37,.37);
        }));
        break;
      }
    }
    return path;
  }

  function fitCanvas(canvas, render) {
    const resize = () => {
      const {clientWidth: w, clientHeight: h} = canvas;
      if (!w || !h) return;
      const ratio = Math.min(devicePixelRatio || 1, 1.7);
      canvas.width = Math.round(w*ratio);
      canvas.height = Math.round(h*ratio);
      render();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();
  }

  for (const [index, art] of [...document.querySelectorAll('.art')].entries()) {
    const canvas = art.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const shape = emblem(art.dataset.object);
    const face = ctx.createLinearGradient(-1,-.9,1,.75);
    for (const [stop,color] of [[0,'#fcffd1'],[.19,'#dafa64'],[.37,'#efff9d'],
      [.49,'#a1bc37'],[.59,'#dbf881'],[.85,'#95b333'],[1,'#c5da68']]) face.addColorStop(stop,color);
    let time = 0, targetX = 0, targetY = 0, x = 0, y = 0, scroll = 0;
    function draw() {
      const w = canvas.width, h = canvas.height;
      const phase = time*.84 + index*1.24;
      const size = Math.min(w*.27,h*.32);
      const yaw = -.45 + Math.sin(phase)*.31 + x*.48 + scroll*.23;
      const pitch = -.23 + Math.cos(phase*.84)*.15 + y*.32;
      const roll = -.18 + Math.sin(phase*.9)*.13 + x*.08;
      const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
      const cr=Math.cos(roll), sr=Math.sin(roll);
      const xx = cy*cr, xy = cy*sr;
      const yx = sp*sy*cr-cp*sr, yy = sp*sy*sr+cp*cr;
      const zx = sy*cp*cr+sp*sr, zy = sy*cp*sr-sp*cr;
      const cx=w*.53 + size*.06*x, centerY=h*.48+Math.sin(phase)*h*.025;
      ctx.resetTransform();
      ctx.clearRect(0,0,w,h);
      const depth = .58 + .1*Math.sin(phase);
      for (let layer=0; layer<16; layer++) {
        const z = (layer/15-.5)*depth;
        ctx.setTransform(size*xx,size*xy,size*yx,size*yy,
          cx+size*z*zx,centerY+size*z*zy);
        ctx.fillStyle = layer === 15 ? face : '#49551c';
        ctx.fill(shape,'evenodd');
        ctx.lineWidth = layer === 15 ? .014 : .012;
        ctx.strokeStyle = layer === 15 ? '#f1ffa6' : '#bfde57';
        ctx.stroke(shape);
      }
      ctx.resetTransform();
    }
    function point(event) {
      if (event.pointerType === 'touch') return;
      const rect = art.getBoundingClientRect();
      targetX = (event.clientX-rect.left)/rect.width*2-1;
      targetY = (event.clientY-rect.top)/rect.height*2-1;
    }
    art.addEventListener('pointermove', point);
    art.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    fitCanvas(canvas, draw);
    art.querySelector('img').hidden = true;
    portfolioMotion.register(art, (clock,delta) => {
      time = clock;
      const ease = 1-Math.exp(-delta*9);
      x += (targetX-x)*ease; y += (targetY-y)*ease;
      scroll = (innerHeight*.5-art.getBoundingClientRect().top)/innerHeight;
      draw();
    });
  }

  // One continuous field threads through the page as the visitor moves down it.
  const field = document.querySelector('.atmosphere');
  if (field) {
    const ctx = field.getContext('2d');
    if (ctx) {
      let time = 0;
      function drawField() {
        const w = field.width, h = field.height;
        const travel = scrollY / innerHeight;
        const phase = time*.16 + travel*.93;
        ctx.clearRect(0,0,w,h);
        for (let lane=0; lane<23; lane++) {
          const v = lane/22-.5;
          ctx.beginPath();
          for (let step=0; step<=64; step++) {
            const u = step/64;
            const wave = Math.sin(u*5.6 + phase);
            const spread = .2+.8*Math.pow(Math.cos(u*4.1-phase*.61),2);
            const y = h*(.60+.24*wave+.11*Math.sin(phase*.68+u*3.2)+v*.28*spread);
            if (!step) ctx.moveTo(0,y); else ctx.lineTo(u*w,y);
          }
          ctx.strokeStyle = 'rgba(166,198,95,.26)';
          ctx.lineWidth = Math.max(.7, w/field.clientWidth*.75);
          ctx.stroke();
        }
      }
      fitCanvas(field, drawField);
      portfolioMotion.register(field, clock => { time=clock; drawField(); });
    }
  }
  const entrances = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    visible.forEach(({target}, index) => {
      portfolioMotion.reveal(target, Math.min(index,3)*65);
      entrances.unobserve(target);
    });
  }, {threshold:.09});
  document.querySelectorAll('.project, .section-head, .keyboard, .stack-intro, .contact > div, #contact-form').forEach(el => entrances.observe(el));
})();
