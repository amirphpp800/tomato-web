
import { useState, useEffect } from 'react';
import './App.css';

// کامپوننت‌ها
import CountrySelector from './components/CountrySelector';
import IPResult from './components/IPResult';
import AuthForm from './components/AuthForm';

// سرویس‌ها
import { 
  generateRandomIPForCountry, 
  fetchIPLocationData, 
  getCountryCode,
  cidrCountriesData
} from './services/IPService';

import {
  validateUser,
  setUserSession,
  validateSession,
  clearSession,
  predefinedUsers
} from './services/AuthService';

export default function App() {
  // وضعیت‌های برنامه
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ایران');
  const [generatedDNS, setGeneratedDNS] = useState('');
  // تاریخچه حذف شده است
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animation, setAnimation] = useState('');
  const [ipLocation, setIpLocation] = useState(null);

  // محدود کردن دسترسی به inspect
  useEffect(() => {
    // جلوگیری از inspect با کلیدهای میانبر
    const preventDevTools = (e) => {
      if (
        (e.keyCode === 123) || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
        return false;
      }
    };

    // جلوگیری از کلیک راست
    const preventRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    // حذف کد HTML محتوا با inspect - تغییر یافته
    const clearHTML = () => {
      if (
        window.devtools && window.devtools.open ||
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160
      ) {
        console.warn("استفاده از DevTools غیرمجاز است");
        // از رفرش اجباری جلوگیری می‌کنیم
      }
    };

    // نصب رویدادها
    window.addEventListener('keydown', preventDevTools);
    document.addEventListener('contextmenu', preventRightClick);

    // بررسی هر 3 ثانیه
    const interval = setInterval(clearHTML, 3000);

    return () => {
      window.removeEventListener('keydown', preventDevTools);
      document.removeEventListener('contextmenu', preventRightClick);
      clearInterval(interval);
    };
  }, []);

  // بررسی اعتبار جلسه در زمان بارگذاری
  useEffect(() => {
    const checkSession = () => {
      const session = validateSession();

      if (session.isValid) {
        setIsLoggedIn(true);
        setUsername(session.username);
        setSessionToken(session.token);

        // تاریخچه DNS حذف شده است
      }

      // اضافه کردن کاربران از پیش تعریف شده اگر وجود ندارند
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.length === 0) {
        localStorage.setItem('users', JSON.stringify(predefinedUsers));
      }
    };

    checkSession();

    // تنظیم بررسی انقضای جلسه هر دقیقه
    const intervalId = setInterval(checkSession, 60000);

    // خروج اجباری هنگام بستن تب
    const handleTabClose = () => {
      handleLogout();
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  // مدیریت ورود
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // احراز هویت بهبود یافته
      const user = validateUser(username, password);

      if (user) {
        // ایجاد جلسه
        const session = setUserSession(username);

        setAnimation('fadeIn');
        setIsLoggedIn(true);
        setSessionToken(session.token);

        // تاریخچه DNS حذف شده است
      } else {
        setAnimation('shake');
        setErrorMessage('نام کاربری یا رمز عبور اشتباه است');
      }
      setIsLoading(false);
    }, 800);
  };

  // مدیریت خروج
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setSessionToken('');
    // تاریخچه حذف شده است
    setGeneratedDNS('');
    setIpLocation(null);

    // پاک کردن جلسه
    clearSession();
  };

  // تولید DNS
  const generateDNS = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setIpLocation(null);

    try {
      // تولید IP تصادفی از محدوده‌های CIDR کشور انتخاب شده
      const randomIP = generateRandomIPForCountry(selectedCountry);

      if (!randomIP) {
        setErrorMessage(`خطا در تولید IP برای کشور ${selectedCountry}`);
        setIsLoading(false);
        return;
      }

      // دریافت اطلاعات مکانی برای IP
      const locationData = await fetchIPLocationData(randomIP);
      setIpLocation(locationData);

      // تولید رکورد DNS
      const timestamp = new Date().getTime();
      const countryCode = getCountryCode(selectedCountry);

      const generatedRecord = {
        ip: randomIP,
        country: selectedCountry,
        countryCode: countryCode,
        cidr: cidrCountriesData[selectedCountry][Math.floor(Math.random() * cidrCountriesData[selectedCountry].length)],
        timestamp: timestamp,
        id: `dns_${timestamp}`,
        locationData: locationData
      };

      setGeneratedDNS(JSON.stringify(generatedRecord, null, 2));

      // تاریخچه DNS حذف شده است
    } catch (error) {
      console.error("Error generating DNS:", error);
      setErrorMessage("خطایی در تولید DNS رخ داد. لطفا دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  // تابع حذف رکورد DNS حذف شده است

  // قالب‌بندی تاریخ
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="app-container">
      <div className="app-background"></div>

      <header>
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          مرکز IP هوشمند
        </h1>

        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            خروج
          </button>
        )}
      </header>

      {!isLoggedIn ? (
        <AuthForm 
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
          isLoading={isLoading}
          errorMessage={errorMessage}
          animation={animation}
        />
      ) : (
        <div className="dns-container dns-container-centered">
          <div className="dns-generator">
            <div className="select-container">
              <div className="form-group">
                {errorMessage && (
                  <div className="error-message">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {errorMessage}
                  </div>
                )}

                <CountrySelector 
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  countries={cidrCountriesData}
                  isLoading={isLoading}
                />

                <button onClick={generateDNS} className="generate-btn animate-pulse-subtle" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                        <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                      </svg>
                      در حال تولید...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                      </svg>
                      تولید IP
                    </>
                  )}
                </button>

                {isLoading && (
                  <div className="progress-bar"></div>
                )}

                <IPResult 
                  generatedDNS={generatedDNS}
                  ipLocation={ipLocation}
                  isLoading={isLoading}
                  setIpLocation={setIpLocation}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{verticalAlign: 'middle', marginLeft: '5px'}}>
            <path d="M10.08 10.86c.05-.33.16-.62.3-.87s.34-.46.59-.62c.24-.15.54-.22.91-.23.23.01.44.05.63.13.2.09.38.21.52.36s.25.33.34.53.13.42.14.64h1.79c-.02-.47-.11-.9-.28-1.29s-.4-.73-.7-1.01-.66-.5-1.08-.66-.88-.23-1.39-.23c-.65 0-1.22.11-1.7.34s-.88.53-1.2.92-.56.84-.71 1.36S8 11.29 8 11.87v.27c0 .58.08 1.12.23 1.64s.39.97.71 1.35.72.69 1.2.91 1.05.34 1.7.34c.47 0 .91-.08 1.32-.23s.77-.36 1.08-.63.56-.58.74-.94.29-.74.3-1.15h-1.79c-.01.21-.06.4-.15.58s-.21.33-.36.46-.32.23-.52.3c-.19.07-.39.09-.6.1-.36-.01-.66-.08-.89-.23-.25-.16-.45-.37-.59-.62s-.25-.55-.3-.88-.08-.67-.08-1v-.27c0-.35.03-.68.08-1.01zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
          {new Date().getFullYear()} - تمامی حقوق محفوظ است | سامانه ایمن تولید IP اختصاصی
        </p>
      </footer>
    </div>
  );
}
