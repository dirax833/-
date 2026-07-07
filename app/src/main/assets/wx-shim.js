// ========== 微信小游戏 API 模拟层（浏览器版）==========

window.wx = {
  getSystemInfoSync() {
    return {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  },

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1';
    document.body.appendChild(canvas);
    return canvas;
  },

  createImage() {
    const img = new Image();
    // 不设置 crossOrigin，避免 file:// 协议下的 CORS 问题
    return img;
  },

  createInnerAudioContext() {
    const audio = new Audio();
    let _src = '';
    let _loop = false;
    let _volume = 1;
    return {
      get src() { return _src; },
      set src(val) { _src = val; audio.src = val; },
      get loop() { return _loop; },
      set loop(val) { _loop = val; audio.loop = val; },
      get volume() { return _volume; },
      set volume(val) { _volume = val; audio.volume = val; },
      play() {
        audio.loop = _loop;
        audio.volume = _volume;
        const p = audio.play();
        if (p && p.catch) p.catch(e => {});
      },
      stop() { audio.pause(); audio.currentTime = 0; },
      pause() { audio.pause(); },
      _audio: audio
    };
  },

  onTouchStart(callback) {
    document.addEventListener('touchstart', (e) => {
      const touches = Array.from(e.touches).map(t => ({
        clientX: t.clientX, clientY: t.clientY, identifier: t.identifier
      }));
      callback({ changedTouches: touches });
    }, { passive: true });
    document.addEventListener('mousedown', (e) => {
      callback({ changedTouches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }] });
    });
  },

  onTouchMove(callback) {
    document.addEventListener('touchmove', (e) => {
      const touches = Array.from(e.touches).map(t => ({
        clientX: t.clientX, clientY: t.clientY, identifier: t.identifier
      }));
      callback({ changedTouches: touches });
    }, { passive: true });
    document.addEventListener('mousemove', (e) => {
      if (e.buttons > 0) {
        callback({ changedTouches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }] });
      }
    });
  },

  onTouchEnd(callback) {
    document.addEventListener('touchend', (e) => {
      const touches = Array.from(e.changedTouches).map(t => ({
        clientX: t.clientX, clientY: t.clientY, identifier: t.identifier
      }));
      callback({ changedTouches: touches });
    }, { passive: true });
    document.addEventListener('mouseup', (e) => {
      callback({ changedTouches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }] });
    });
  },

  onShow(callback) {
    if (document.readyState === 'complete') {
      callback();
    } else {
      window.addEventListener('load', callback);
    }
  }
};

window.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

window.addEventListener('resize', () => {
  if (typeof canvas !== 'undefined' && canvas) {
    const info = wx.getSystemInfoSync();
    canvas.width = info.screenWidth * info.pixelRatio;
    canvas.height = info.screenHeight * info.pixelRatio;
    if (typeof ctx !== 'undefined' && ctx) {
      ctx.scale(info.pixelRatio, info.pixelRatio);
    }
    if (typeof W !== 'undefined') { W = info.screenWidth; }
    if (typeof H !== 'undefined') { H = info.screenHeight; }
  }
});

window.addEventListener('click', function unlockAudio() {
  if (typeof GS !== 'undefined' && GS.titleBgm && GS.bgmPlaying === 'title') {
    try { GS.titleBgm.play(); } catch(e) {}
  }
  window.removeEventListener('click', unlockAudio);
}, { once: true });
