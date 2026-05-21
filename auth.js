/**
 * Firework SSO Guard
 * @fireworkhq.com アカウントのみアクセス可能にする Google OAuth 認証ガード
 *
 * 使用方法:
 *   <script src="/pages/mccm-proposal/auth.js"></script>
 *   <script>FireworkSSO.protect();</script>
 *
 * 必須: Google Cloud Console で OAuth 2.0 クライアント ID を取得し、
 *       CLIENT_ID に設定すること。
 */

(function () {
  'use strict';

  const CONFIG = {
    CLIENT_ID: '1001667206230-ljl0oogq5vmgia28sk37bo3restv23gc.apps.googleusercontent.com',
    ALLOWED_DOMAIN: 'fireworkhq.com',
    TOKEN_KEY: 'firework_sso_token',
    TOKEN_EXPIRY_KEY: 'firework_sso_token_expiry',
    TOKEN_TTL_MS: 8 * 60 * 60 * 1000, // 8時間
  };

  const STYLES = `
    #fw-sso-overlay {
      position: fixed;
      inset: 0;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', -apple-system, sans-serif;
    }
    #fw-sso-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    #fw-sso-logo {
      font-size: 48px;
      margin-bottom: 16px;
    }
    #fw-sso-title {
      color: #f1f5f9;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    #fw-sso-subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    #fw-sso-btn {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      color: #1f2937;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      width: 100%;
      justify-content: center;
    }
    #fw-sso-btn:hover { background: #f1f5f9; transform: translateY(-1px); }
    #fw-sso-btn:active { transform: translateY(0); }
    #fw-sso-btn svg { flex-shrink: 0; }
    #fw-sso-error {
      color: #f87171;
      font-size: 13px;
      margin-top: 16px;
      display: none;
    }
    #fw-sso-loading {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 16px;
      display: none;
    }
  `;

  const GOOGLE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function showOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'fw-sso-overlay';
    overlay.innerHTML = `
      <div id="fw-sso-card">
        <div id="fw-sso-logo">🔒</div>
        <div id="fw-sso-title">Firework 社内資料</div>
        <div id="fw-sso-subtitle">
          @fireworkhq.com のアカウントで<br>ログインしてください
        </div>
        <button id="fw-sso-btn">
          ${GOOGLE_SVG}
          Google でログイン
        </button>
        <div id="fw-sso-error">
          @fireworkhq.com のアカウントでログインしてください
        </div>
        <div id="fw-sso-loading">認証中...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('fw-sso-btn').addEventListener('click', startLogin);
    return overlay;
  }

  function hideOverlay() {
    const overlay = document.getElementById('fw-sso-overlay');
    if (overlay) overlay.remove();
  }

  function loadGoogleApi(callback) {
    if (window.google && window.google.accounts) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function startLogin() {
    const btn = document.getElementById('fw-sso-btn');
    const loading = document.getElementById('fw-sso-loading');
    const error = document.getElementById('fw-sso-error');

    btn.style.display = 'none';
    loading.style.display = 'block';
    error.style.display = 'none';

    loadGoogleApi(function () {
      google.accounts.id.initialize({
        client_id: CONFIG.CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      google.accounts.id.prompt(function (notification) {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap が表示できない場合は OAuth フローにフォールバック
          const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: 'email profile',
            callback: handleTokenResponse,
          });
          tokenClient.requestAccessToken();
        }
      });
    });
  }

  function handleCredentialResponse(response) {
    try {
      const payload = parseJwt(response.credential);
      validateAndProceed(payload.email, response.credential, Date.now() + CONFIG.TOKEN_TTL_MS);
    } catch (e) {
      showError();
    }
  }

  function handleTokenResponse(tokenResponse) {
    if (tokenResponse.error) {
      showError();
      return;
    }
    // アクセストークンでユーザー情報を取得
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer ' + tokenResponse.access_token },
    })
      .then(function (r) { return r.json(); })
      .then(function (info) {
        const expiry = Date.now() + Math.min(
          tokenResponse.expires_in * 1000,
          CONFIG.TOKEN_TTL_MS
        );
        validateAndProceed(info.email, tokenResponse.access_token, expiry);
      })
      .catch(showError);
  }

  function validateAndProceed(email, token, expiry) {
    if (!email || !email.endsWith('@' + CONFIG.ALLOWED_DOMAIN)) {
      showError();
      return;
    }
    sessionStorage.setItem(CONFIG.TOKEN_KEY, token);
    sessionStorage.setItem(CONFIG.TOKEN_EXPIRY_KEY, String(expiry));
    hideOverlay();
  }

  function showError() {
    const btn = document.getElementById('fw-sso-btn');
    const loading = document.getElementById('fw-sso-loading');
    const error = document.getElementById('fw-sso-error');
    if (btn) btn.style.display = 'flex';
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
  }

  function isAuthenticated() {
    const token = sessionStorage.getItem(CONFIG.TOKEN_KEY);
    const expiry = sessionStorage.getItem(CONFIG.TOKEN_EXPIRY_KEY);
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry, 10);
  }

  function parseJwt(token) {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); })
        .join('')
    );
    return JSON.parse(json);
  }

  window.FireworkSSO = {
    /**
     * ページを保護する。未認証の場合はオーバーレイを表示。
     */
    protect: function () {
      if (isAuthenticated()) return;

      injectStyles();

      if (document.body) {
        showOverlay();
      } else {
        document.addEventListener('DOMContentLoaded', showOverlay);
      }
    },

    /**
     * 現在の認証状態を確認する。
     */
    isAuthenticated: isAuthenticated,

    /**
     * ログアウト（セッションクリア）。
     */
    logout: function () {
      sessionStorage.removeItem(CONFIG.TOKEN_KEY);
      sessionStorage.removeItem(CONFIG.TOKEN_EXPIRY_KEY);
      location.reload();
    },
  };
})();
