/**
 * Firework パスワードゲート — クライアント送付HTML用
 *
 * 使い方:
 * 1. パスワードを決める（例: Client-AbCd1234）
 * 2. ターミナルで: printf '%s' "パスワード" | shasum -a 256 | cut -d' ' -f1
 * 3. 出力されたハッシュ値を PASSWORD_HASH に貼る
 * 4. STORAGE_KEY を案件名に合わせて変える（例: samsung_proposal_auth）
 * 5. TITLE を資料タイトルに変える
 */
(function () {
  'use strict';
  var PASSWORD_HASH = 'ここにSHA-256ハッシュ値を貼る';
  var STORAGE_KEY   = '案件名_auth';
  var TITLE         = '企画資料タイトル';
  var SUBTITLE      = 'この資料はパスワードで保護されています';

  function sha256Hex(text) {
    var enc = new TextEncoder();
    return crypto.subtle.digest('SHA-256', enc.encode(text)).then(function (buf) {
      var bytes = new Uint8Array(buf), hex = '';
      for (var i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
      return hex;
    });
  }
  function reveal() {
    var g = document.getElementById('fw-gate');
    if (g) g.remove();
    document.body.style.overflow = '';
  }
  function buildGate() {
    document.body.style.overflow = 'hidden';
    var w = document.createElement('div');
    w.id = 'fw-gate';
    w.innerHTML = '<div class="fw-gate-card"><div class="fw-gate-icon">🔒</div><h1>' + TITLE + '</h1><p>' + SUBTITLE + '</p><form id="fw-gate-form" autocomplete="off"><input id="fw-gate-input" type="password" placeholder="パスワードを入力" autofocus><button type="submit">閲覧する</button></form><div id="fw-gate-err" class="fw-gate-err"></div></div>';
    document.body.appendChild(w);
    var s = document.createElement('style');
    s.textContent = '#fw-gate{position:fixed;inset:0;z-index:99999;background:#1A1A2E;display:flex;align-items:center;justify-content:center;font-family:"Noto Sans JP",sans-serif;padding:24px;}.fw-gate-card{background:#fff;border-radius:14px;padding:40px 36px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.4);}.fw-gate-icon{font-size:40px;margin-bottom:14px;}.fw-gate-card h1{font-size:17px;font-weight:700;color:#1A1A2E;margin:0 0 6px;}.fw-gate-card p{font-size:12px;color:#888;margin:0 0 22px;}#fw-gate-form{display:flex;flex-direction:column;gap:10px;}#fw-gate-input{padding:12px 14px;border:1px solid #ccc;border-radius:8px;font-size:14px;outline:none;}#fw-gate-input:focus{border-color:#FA006D;}#fw-gate-form button{padding:12px;border:none;border-radius:8px;background:#FA006D;color:#fff;font-size:14px;font-weight:700;cursor:pointer;}.fw-gate-err{color:#FA006D;font-size:12px;margin-top:12px;min-height:16px;}';
    document.head.appendChild(s);
    document.getElementById('fw-gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      sha256Hex(document.getElementById('fw-gate-input').value).then(function (hex) {
        if (hex === PASSWORD_HASH) {
          try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
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
    try { ok = localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}
    if (!ok) buildGate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
