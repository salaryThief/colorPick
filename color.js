/* global chrome */
{
  const colorCodes = [
    document.getElementById('r'),
    document.getElementById('g'),
    document.getElementById('b'),
    document.getElementById('a'),
  ];

  const colorCodesHex = [
    document.getElementById('rH'),
    document.getElementById('gH'),
    document.getElementById('bH'),
    document.getElementById('aH'),
  ];
  const canvas = document.getElementById('target');
  const canvasMini = document.getElementById('loupe');
  const ctx = canvas.getContext('2d');
  const ctxMini = canvasMini.getContext('2d');
  const MAX_X = 1080;
  const MAX_Y = 960;
  const rgbCoefficient = [0.3, 0.6, 0.1, 1];
  const src = document.createElement('src');
  src.addEventListener('srcload', load);
  const event = document.createEvent('HTMLEvents');
  event.initEvent('srcload', false, true);

  const srcUrl = window.location.search.match(/srcUrl=(.+)/)[1];
  chrome.runtime.sendMessage({ displayName: 'color', fileName: srcUrl }, (response) => {
    src.image = response;
    src.dispatchEvent(event);
  });

  function pos(ev) {
    const rect = ev.target.getBoundingClientRect();
    return {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    };
  }
  class Sample {
    constructor(cd) {
      const obj = document.createElement('div');
      obj.style.backgroundColor = `#${cd}`;
      obj.innerText = `#${cd}`;
      obj.style.width = '100px'
      obj.style.height = '100px'
      obj.style.cssFloat = 'left'
      obj.style.color = this.getFontColor();
      this.addElm(obj);
    };
    addElm(obj) {
      document.body.appendChild(obj);
    };

    getFontColor() {
      let array = colorCodes.map((o, i) => {
        return o.value * rgbCoefficient[i];
      });
      array.pop();
      let boundary = array.reduce((p, c) => { return p + c; });
      return boundary > 127 ? 'black' : 'white';
    }
  }

  function analyticsColorAndCreateSample(pixel) {
    Array.from(pixel.data).forEach((n, i) => {
      colorCodes[i].value = n;
      colorCodesHex[i].value = n.toString(16).padStart(2, '0');
    });
    const cd = colorCodesHex.map(elm => elm.value).join('');
    document.getElementById('sample').style.backgroundColor = `#${cd}`;
    new Sample(cd);
  }

  function load() {
    const img = new Image();
    img.src = decodeURIComponent(src.image);
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => {
      const x = img.width;
      const y = img.height;

      const rX = x / MAX_X;
      const rY = y / MAX_Y;

      const ratio = Math.max(Math.max(rX, rY), 1);
      const width = parseInt(x / ratio, 10);
      const height = parseInt(y / ratio, 10);
      canvas.width = width < 200 ? 200 : width;
      canvas.height = height < 200 ? 200 : height;

      ctx.drawImage(img, width < 200 ? (200 - width) / 2 : 0, height < 200 ? (200 - height) / 2 : 0, width, height);
      document.getElementsByTagName('main')[0].style.width = `${width < 200 ? 200 : width}px`;
    });
  }
  class LOUPE {
    constructor() {
      this.oneSide = 200;
      this.magnification = [
        10,
        20,
        40,
        50,
        80,
        100,
        200,
      ];
      document.getElementById("magnification").innerText = `${200 / this.oneSide}倍`;
    }

    zoom(ev) {
      if (ev.deltaY < 0) {
        if (this.magnification.indexOf(this.oneSide) !== 0) {
          this.oneSide = this.magnification[this.magnification.indexOf(this.oneSide) - 1];
        }
      } else if (ev.deltaY > 0)
        if (this.magnification.indexOf(this.oneSide) !== this.magnification.length - 1) {
          this.oneSide = this.magnification[this.magnification.indexOf(this.oneSide) + 1];
        }
      document.getElementById("magnification").innerText = `${200 / this.oneSide}倍`;
    }

    action(ev) {
      const position = pos(ev);
      const { oneSide } = this;
      const X = position.x - (oneSide / 2);
      const Y = position.y - (oneSide / 2);
      ctxMini.clearRect(0, 0, canvas.width, canvas.height);
      ctxMini.drawImage(
        canvas,
        X,
        Y,
        oneSide,
        oneSide,
        0,
        0,
        200,
        200,
      );
    }
  }

  const loupe = new LOUPE();
  // クリックイベントの登録
  canvas.addEventListener('click', (ev) => {
    const position = pos(ev);
    const pixel = ctx.getImageData(position.x, position.y, 1, 1);
    analyticsColorAndCreateSample(pixel);
  });

  // 虫眼鏡の挙動
  canvas.addEventListener('mousemove', (ev) => {
    loupe.action(ev);
    canvasMini.style.left = `${ev.clientX - 100}px`;
    canvasMini.style.top = `${ev.clientY - 100}px`;
  });

  canvas.addEventListener('mouseenter', () => {
    document.body.classList.remove('none');
  });

  canvas.addEventListener('mouseleave', () => {
    document.body.classList.add('none');
  });

  canvasMini.addEventListener('keydown', () => {
    canvasMini.style.pointerEvents = 'all'
  });
  canvasMini.addEventListener('keyup', () => {
    canvasMini.style.pointerEvents = 'none';
  });

  canvas.addEventListener('wheel', (ev) => {
    loupe.zoom(ev);
    loupe.action(ev);
  });
}
