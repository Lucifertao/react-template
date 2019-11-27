(function (window, document) {
  const hotcss = {};

  (function () {
    let viewportEl = document.querySelector('meta[name="viewport"]');
    const hotcssEl = document.querySelector('meta[name="hotcss"]');
    let dpr = window.devicePixelRatio || 1;
    let maxWidth = 1080;
    let designWidth = 1080;

    dpr = dpr >= 3 ? 3 : dpr >= 2 ? 2 : 1;
    if (hotcssEl) {
      const hotcssCon = hotcssEl.getAttribute('content');
      if (hotcssCon) {
        const initialDprMatch = hotcssCon.match(/initial\-dpr=([\d\.]+)/);
        if (initialDprMatch) {
          dpr = parseFloat(initialDprMatch[1]);
        }
        const maxWidthMatch = hotcssCon.match(/max\-width=([\d\.]+)/);
        if (maxWidthMatch) {
          maxWidth = parseFloat(maxWidthMatch[1]);
        }
        const designWidthMatch = hotcssCon.match(/design\-width=([\d\.]+)/);
        if (designWidthMatch) {
          designWidth = parseFloat(designWidthMatch[1]);
        }
      }
    }

    document.documentElement.setAttribute('data-dpr', dpr);
    hotcss.dpr = dpr;

    document.documentElement.setAttribute('max-width', maxWidth);
    hotcss.maxWidth = maxWidth;

    if (designWidth) {
      document.documentElement.setAttribute('design-width', designWidth);
    }
    hotcss.designWidth = designWidth;

    const scale = 1 / dpr;
    const content = `width=device-width, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=no`;

    if (viewportEl) {
      viewportEl.setAttribute('content', content);
    } else {
      viewportEl = document.createElement('meta');
      viewportEl.setAttribute('name', 'viewport');
      viewportEl.setAttribute('content', content);
      document.head.appendChild(viewportEl);
    }
  }());
  hotcss.mresize = function () {
    // 对，这个就是核心方法了，给HTML设置font-size。
    let innerWidth = document.documentElement.getBoundingClientRect().width
      || window.innerWidth;

    if (hotcss.maxWidth && innerWidth / hotcss.dpr > hotcss.maxWidth) {
      innerWidth = hotcss.maxWidth * hotcss.dpr;
    }

    if (!innerWidth) {
      return false;
    }

    document.documentElement.style.fontSize = `${innerWidth / 10}px`;

    hotcss.callback && hotcss.callback();
  };

  hotcss.mresize();
  // 直接调用一次

  window.addEventListener(
    'resize',
    () => {
      clearTimeout(hotcss.tid);
      hotcss.tid = setTimeout(hotcss.mresize, 33);
    },
    false,
  );
  // 绑定resize的时候调用

  window.addEventListener('load', hotcss.mresize, false);
  // 防止不明原因的bug。load之后再调用一次。

  setTimeout(() => {
    hotcss.mresize();
  }, 333);

  window.hotcss = hotcss;
}(window, document));
