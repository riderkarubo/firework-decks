/**
 * Simple password gate for partner-facing static pages.
 * パスワードは SHA-256 ハッシュで照合（平文はコードに含めない）。
 * 認証成功後は sessionStorage に保持し、リロード時の再入力を不要にする。
 *
 * 注意: クライアントサイドのみの簡易保護。検索エンジン除外・URL漏れ対策レベル。
 *       機密度が高い場合はサーバーサイド認証を検討すること。
 */
(function () {
  'use strict';

  // 許可パスワードの SHA-256 ハッシュ（平文は埋め込まない）
  var PASSWORD_HASH = '5e7bd34f52bcb93e393e25cc7be9c7be2ff38524f683cba7cc461388fab0ef2b';
  var STORAGE_KEY = 'mtg_terada_order_auth';
  var TITLE = 'Firework ｜ ライブ配信制作 ご依頼資料';
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
      '#fw-gate-form button{padding:12px;border:none;border-radius:8px;background:#FA006D;color:#fff;font-size:14px;font-weight:700;cursor:pointer;}',
      '#fw-gate-form button:hover{opacity:.9;}',
      '.fw-gate-err{color:#FA006D;font-size:12px;margin-top:12px;min-height:16px;}'
    ].join('');
    document.head.appendChild(style);

    document.getElementById('fw-gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var val = document.getElementById('fw-gate-input').value;
      sha256Hex(val).then(function (hex) {
        if (hex === PASSWORD_HASH) {
          try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
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
    try { ok = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}
    if (!ok) buildGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
