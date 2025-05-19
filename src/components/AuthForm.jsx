
import React from 'react';

const AuthForm = ({ username, password, setUsername, setPassword, handleLogin, isLoading, errorMessage, animation }) => {
  return (
    <div className={`auth-container ${animation}`}>
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
        </svg>
        ورود به سیستم
      </h2>

      {errorMessage && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            نام کاربری
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="نام کاربری خود را وارد کنید"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            رمز عبور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور خود را وارد کنید"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
              </svg>
              در حال پردازش...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
              </svg>
              ورود
            </>
          )}
        </button>
      </form>

      <div style={{marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)'}}>
        <p>لطفا با نام کاربری و رمز عبور خود وارد شوید</p>
        <p>اطلاعات ورود در اختیار شما قرار گرفته است</p>
        <hr style={{margin: '10px 0', opacity: 0.3}} />
      </div>
    </div>
  );
};

export default AuthForm;
