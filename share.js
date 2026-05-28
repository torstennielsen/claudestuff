/**
 * share.js — Del-knap med Facebook, e-mail og kopiér link
 *
 * BRUG:
 *   1. Inkludér dette script på siden:
 *        <script src="share.js" defer></script>
 *
 *   2. Tilføj class "js-del-artikel" til den knap du vil erstatte:
 *        <button class="js-del-artikel">Del artikel ...</button>
 *
 *   På mobil med Web Share API (iOS Safari, Android Chrome) bruges native share.
 *   På desktop erstattes knappen med tre ikoner: Facebook · E-mail · Kopiér link
 */

(function () {
  /* ─── Ikoner (inline SVG) ───────────────────────────────────────────── */
  const ICONS = {
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.514c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>`,

    mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>`,

    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>`,

    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>`,
  };

  /* ─── CSS injiceres én gang ──────────────────────────────────────────── */
  const CSS = `
    .del-artikel-knapper {
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }

    .del-artikel-ikon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      color: #fff;
      background: #222;
      transition: background 0.18s ease, transform 0.12s ease;
      position: relative;
    }

    .del-artikel-ikon svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
      display: block;
    }

    .del-artikel-ikon:hover {
      transform: scale(1.08);
    }

    .del-artikel-ikon--facebook { background: #1877f2; }
    .del-artikel-ikon--facebook:hover { background: #1560cc; }

    .del-artikel-ikon--mail { background: #555; }
    .del-artikel-ikon--mail:hover { background: #3a3a3a; }

    .del-artikel-ikon--copy { background: #333; }
    .del-artikel-ikon--copy:hover { background: #111; }

    .del-artikel-ikon--copied {
      background: #2a7d34 !important;
      transform: scale(1.08);
    }

    /* Tooltip */
    .del-artikel-ikon::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 7px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,.82);
      color: #fff;
      font-family: inherit;
      font-size: 12px;
      line-height: 1;
      padding: 5px 9px;
      border-radius: 5px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .del-artikel-ikon:hover::after,
    .del-artikel-ikon:focus-visible::after {
      opacity: 1;
    }
  `;

  function injectStyles() {
    if (document.getElementById('del-artikel-css')) return;
    const tag = document.createElement('style');
    tag.id = 'del-artikel-css';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  /* ─── Hjælpefunktioner ───────────────────────────────────────────────── */
  function currentUrl()   { return window.location.href; }
  function currentTitle() { return document.title || ''; }

  function openFacebook() {
    const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(currentUrl());
    window.open(url, '_blank', 'noopener,width=640,height=460');
  }

  function openMail() {
    const subject = encodeURIComponent(currentTitle());
    const body    = encodeURIComponent(currentUrl());
    window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
  }

  function copyLink(btn) {
    navigator.clipboard.writeText(currentUrl()).then(function () {
      btn.innerHTML = ICONS.check;
      btn.dataset.tip = 'Kopieret!';
      btn.classList.add('del-artikel-ikon--copied');
      setTimeout(function () {
        btn.innerHTML = ICONS.copy;
        btn.dataset.tip = 'Kopiér link';
        btn.classList.remove('del-artikel-ikon--copied');
      }, 2200);
    }).catch(function () {
      /* Fallback til ældre browsere */
      var ta = document.createElement('textarea');
      ta.value = currentUrl();
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.dataset.tip = 'Kopieret!';
    });
  }

  /* ─── Knap-fabrik ────────────────────────────────────────────────────── */
  function makeBtn(extraClass, icon, tooltip, clickFn) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'del-artikel-ikon ' + extraClass;
    btn.innerHTML = icon;
    btn.dataset.tip = tooltip;
    btn.setAttribute('aria-label', tooltip);
    btn.addEventListener('click', clickFn);
    return btn;
  }

  /* ─── Erstat ét element ──────────────────────────────────────────────── */
  function replaceTrigger(el) {
    /* Native share (iOS Safari, Android Chrome, m.fl.) */
    if (navigator.share) {
      el.addEventListener('click', function () {
        navigator.share({ title: currentTitle(), url: currentUrl() })
          .catch(function () { /* bruger annullerede – ignorer */ });
      });
      return; /* lad den originale knap stå */
    }

    /* Desktop: erstat med tre ikoner */
    var wrapper = document.createElement('div');
    wrapper.className = 'del-artikel-knapper';

    wrapper.appendChild(
      makeBtn('del-artikel-ikon--facebook', ICONS.facebook, 'Del på Facebook', openFacebook)
    );
    wrapper.appendChild(
      makeBtn('del-artikel-ikon--mail', ICONS.mail, 'Del via e-mail', openMail)
    );

    var copyBtn = makeBtn('del-artikel-ikon--copy', ICONS.copy, 'Kopiér link', function () {
      copyLink(copyBtn);
    });
    wrapper.appendChild(copyBtn);

    el.replaceWith(wrapper);
  }

  /* ─── Init ───────────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    document.querySelectorAll('.js-del-artikel').forEach(replaceTrigger);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
