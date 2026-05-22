/**
 * Simple password gate for client-facing static pages.
 * パスワードは SHA-256 ハッシュで照合（平文はコードに含めない）。
 * 「パスワードを記憶する」チェック ON → localStorage（永続）
 *                         チェック OFF → sessionStorage（タブを閉じると消える）
 */
(function () {
  'use strict';

  var PASSWORD_HASH = '280c0eccde82e96deb0ef4184bace01ccce15380f22c0791e9b2d7e70a2438f2';
  var STORAGE_KEY = 'fw_workflow_guide_auth';
  var TITLE = 'Firework | 社内ガイド';
  var SUBTITLE = 'この資料はパスワードで保護されています';

  function sha256Hex(text) {
    var enc = new TextEncoder();
    return crypto.subtle.digest('SHA-256', enc.encode(text)).then(function (buf) {
      var bytes = new Uint8Array(buf);
      var hex = '';
      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    });
  }

  function reveal() {
    var gate = document.getElementById('fw-gate');
    if (gate) gate.remove();
    document.body.style.overflow = '';
  }

  function buildGate() {
    document.body.style.overflow = 'hidden';
    var wrap = document.createElement('div');
    wrap.id = 'fw-gate';
    wrap.innerHTML = [
      '<div class="fw-gate-card">',
      '  <div class="fw-gate-icon">🔒</div>',
      '  <h1>' + TITLE + '</h1>',
      '  <p>' + SUBTITLE + '</p>',
      '  <form id="fw-gate-form" autocomplete="off">',
      '    <input id="fw-gate-input" type="password" placeholder="パスワードを入力" autofocus>',
      '    <label class="fw-gate-remember">',
      '      <input type="checkbox" id="fw-gate-remember" checked>',
      '      <span>パスワードを記憶する</span>',
      '    </label>',
      '    <button type="submit">閲覧する</button>',
      '  </form>',
      '  <div id="fw-gate-err" class="fw-gate-err"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(wrap);

    var style = document.createElement('style');
    style.textContent = [
      '#fw-gate{position:fixed;inset:0;z-index:99999;background:#1A1A2E;display:flex;align-items:center;justify-content:center;font-family:"Noto Sans JP","Hiragino Sans",sans-serif;padding:24px;}',
      '.fw-gate-card{background:#fff;border-radius:14px;padding:40px 36px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.4);}',
      '.fw-gate-icon{font-size:40px;margin-bottom:14px;}',
      '.fw-gate-card h1{font-size:17px;font-weight:700;color:#1A1A2E;margin:0 0 6px;}',
      '.fw-gate-card p{font-size:12px;color:#888;margin:0 0 22px;}',
      '#fw-gate-form{display:flex;flex-direction:column;gap:10px;}',
      '#fw-gate-input{padding:12px 14px;border:1px solid #ccc;border-radius:8px;font-size:14px;outline:none;}',
      '#fw-gate-input:focus{border-color:#FA006D;}',
      '.fw-gate-remember{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#555;cursor:pointer;user-select:none;}',
      '.fw-gate-remember input[type=checkbox]{width:14px;height:14px;accent-color:#FA006D;cursor:pointer;}',
      '#fw-gate-form button{padding:12px;border:none;border-radius:8px;background:#FA006D;color:#fff;font-size:14px;font-weight:700;cursor:pointer;}',
      '#fw-gate-form button:hover{opacity:.9;}',
      '.fw-gate-err{color:#FA006D;font-size:12px;margin-top:12px;min-height:16px;}'
    ].join('');
    document.head.appendChild(style);

    document.getElementById('fw-gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var val = document.getElementById('fw-gate-input').value;
      var remember = document.getElementById('fw-gate-remember').checked;
      sha256Hex(val).then(function (hex) {
        if (hex === PASSWORD_HASH) {
          try {
            if (remember) {
              localStorage.setItem(STORAGE_KEY, '1');
            } else {
              sessionStorage.setItem(STORAGE_KEY, '1');
            }
          } catch (_) {}
          reveal();
        } else {
          document.getElementById('fw-gate-err').textContent = 'パスワードが正しくありません。';
          document.getElementById('fw-gate-input').value = '';
        }
      });
    });
  }

  function init() {
    var ok = false;
    try {
      ok = localStorage.getItem(STORAGE_KEY) === '1' ||
           sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {}
    if (!ok) buildGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
