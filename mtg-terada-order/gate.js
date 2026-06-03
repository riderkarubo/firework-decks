/**
 * Firework パスワードゲート — クライアント/パートナー送付HTML用
 *
 * パスワードは SHA-256 ハッシュで照合（平文はコードに含めない）。
 *
 * 【パスワード記憶（2系統）】
 * 1. 「パスワードを記憶する」チェック ON  → localStorage（ブラウザを閉じても維持）
 *                            チェック OFF → sessionStorage（タブを閉じると消える）
 * 2. Chrome等のパスワードマネージャ保存対応:
 *    - <form> に autocomplete を有効化し、username（ダミー）+ current-password を持たせる
 *    - 認証成功時にブラウザの「パスワードを保存しますか？」ダイアログが出るようにする
 *      （フォームを submit 扱いで処理 → 次回アクセス時にChromeが自動入力）
 *
 * 使い方:
 * 1. printf '%s' "パスワード" | shasum -a 256 | cut -d' ' -f1 でハッシュ生成
 * 2. PASSWORD_HASH に貼る / STORAGE_KEY を案件名に / TITLE を資料名に
 */
(function () {
  'use strict';

  var PASSWORD_HASH = '5e7bd34f52bcb93e393e25cc7be9c7be2ff38524f683cba7cc461388fab0ef2b';
  var STORAGE_KEY = 'mtg_terada_order_auth';
  var TITLE = 'Firework ｜ ライブ配信制作 ご依頼資料';
  var SUBTITLE = 'この資料はパスワードで保護されています';
  // Chromeパスワードマネージャ上で識別するためのダミーユーザー名（案件ごとに一意推奨）
  var GATE_USERNAME = 'mtg-terada-order';

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
    // action/method を持つ本物のフォームにし、autocomplete を有効化（Chrome保存対応）
    // username はダミー（hidden ではなく可視性0で置くと認識率が上がる）
    wrap.innerHTML = [
      '<div class="fw-gate-card">',
      '  <div class="fw-gate-icon">🔒</div>',
      '  <h1>' + TITLE + '</h1>',
      '  <p>' + SUBTITLE + '</p>',
      '  <form id="fw-gate-form" method="post" action="#" autocomplete="on">',
      '    <input type="text" id="fw-gate-user" name="username" value="' + GATE_USERNAME + '" autocomplete="username" readonly class="fw-gate-userhide" tabindex="-1" aria-hidden="true">',
      '    <input id="fw-gate-input" type="password" name="password" placeholder="パスワードを入力" autocomplete="current-password" autofocus>',
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
      // username ダミーは視覚的に隠すが DOM/アクセシビリティ上は存在させる（Chrome認識用）
      '.fw-gate-userhide{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);border:0;opacity:0;pointer-events:none;}',
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
      var input = document.getElementById('fw-gate-input');
      var val = input.value;
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
          // Chromeのパスワード保存ダイアログを促す:
          // submit イベント後に input の値を保持したまま少し待ってから reveal すると
          // ブラウザが「保存しますか？」を出しやすい。Credential Management API があれば明示保存。
          if (window.PasswordCredential) {
            try {
              var cred = new window.PasswordCredential({
                id: GATE_USERNAME,
                password: val,
                name: TITLE
              });
              if (navigator.credentials && navigator.credentials.store) {
                navigator.credentials.store(cred).catch(function () {});
              }
            } catch (_) {}
          }
          setTimeout(reveal, 0);
        } else {
          document.getElementById('fw-gate-err').textContent = 'パスワードが正しくありません。';
          input.value = '';
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
