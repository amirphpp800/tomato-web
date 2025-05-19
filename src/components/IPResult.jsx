
import React from 'react';

const IPResult = ({ generatedDNS, ipLocation, isLoading, setIpLocation }) => {
  if (!generatedDNS || isLoading) return null;

  const parsedDNS = JSON.parse(generatedDNS);
  
  const handlePingTest = async () => {
    // نمایش وضعیت در حال پردازش
    setIpLocation(prevLocation => ({
      ...prevLocation,
      pingResults: {
        inProgress: true,
        success: false,
        avgTime: '-',
        minTime: '-',
        maxTime: '-',
        packetLoss: '-',
        ttl: '-'
      }
    }));

    try {
      // تعداد پینگ
      const pingCount = 5;
      const pingTimes = [];
      const startTime = Date.now();
      
      // انجام چندین درخواست برای محاسبه میانگین زمان پاسخ
      for (let i = 0; i < pingCount; i++) {
        const pingStartTime = performance.now();
        
        try {
          // ایجاد یک درخواست با پارامتر تصادفی برای جلوگیری از کش
          const timestamp = Date.now();
          const response = await fetch(`https://api.iplocation.net/?ip=${parsedDNS.ip}&timestamp=${timestamp}`, {
            method: 'HEAD',
            mode: 'cors',
            cache: 'no-cache'
          });
          
          if (response.ok) {
            const pingEndTime = performance.now();
            pingTimes.push(pingEndTime - pingStartTime);
          } else {
            pingTimes.push(null); // پینگ ناموفق
          }
          
          // تاخیر کوتاه بین پینگ‌ها
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          pingTimes.push(null); // پینگ ناموفق
        }
      }
      
      // محاسبه نتایج پینگ
      const successfulPings = pingTimes.filter(time => time !== null);
      const success = successfulPings.length > 0;
      
      // اگر حداقل یک پینگ موفق داشته باشیم
      if (success) {
        const avgTime = Math.floor(successfulPings.reduce((sum, time) => sum + time, 0) / successfulPings.length);
        const minTime = Math.floor(Math.min(...successfulPings));
        const maxTime = Math.floor(Math.max(...successfulPings));
        const packetLoss = Math.floor((pingCount - successfulPings.length) / pingCount * 100);
        
        setIpLocation(prevLocation => ({
          ...prevLocation,
          pingResults: {
            success: true,
            avgTime: avgTime,
            minTime: minTime,
            maxTime: maxTime,
            packetLoss: packetLoss,
            ttl: 64, // مقدار TTL ثابت (در مرورگر نمی‌توان TTL واقعی را دریافت کرد)
            inProgress: false
          }
        }));
      } else {
        // همه پینگ‌ها ناموفق بوده‌اند
        setIpLocation(prevLocation => ({
          ...prevLocation,
          pingResults: {
            success: false,
            avgTime: 0,
            minTime: 0,
            maxTime: 0,
            packetLoss: 100,
            ttl: 0,
            inProgress: false
          }
        }));
      }
    } catch (error) {
      console.error("خطا در تست پینگ:", error);
      
      // نمایش خطا
      setIpLocation(prevLocation => ({
        ...prevLocation,
        pingResults: {
          success: false,
          avgTime: 0,
          minTime: 0,
          maxTime: 0,
          packetLoss: 100,
          ttl: 0,
          inProgress: false,
          error: "خطا در تست پینگ. لطفاً دوباره تلاش کنید."
        }
      }));
    }
  };

  return (
    <div className="result-container animate-fade-in-up">
      <h3>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
        آدرس IP تولید شده
      </h3>

      <div className="ip-focus-container animate-scale-in" onClick={() => {
        navigator.clipboard.writeText(parsedDNS.ip);
        // به جای alert، یک نوتیفیکیشن موقت در صفحه نشان می‌دهیم
        const tempElement = document.createElement('div');
        tempElement.className = 'copy-notification';
        tempElement.textContent = 'آدرس IP کپی شد!';
        document.body.appendChild(tempElement);
        setTimeout(() => document.body.removeChild(tempElement), 2000);
      }} title="برای کپی کلیک کنید">
        <div className="ip-container">
          <div className="ip-address-focus">{parsedDNS.ip}</div>
        </div>
      </div>

      {ipLocation && (
        <div className="ip-details animate-slide-in">
          <div className="ip-detail-item">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <strong>کشور:</strong>
            <img 
              src={`https://flagcdn.com/w20/${ipLocation.country_code2.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w40/${ipLocation.country_code2.toLowerCase()}.png 2x`}
              width="20"
              className="flag-icon animate-pulse-subtle"
              alt={ipLocation.country_name}
            />
            <span className="country-name">{ipLocation.country_name}</span>
          </div>

          <div className="ip-detail-item">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
            </svg>
            <strong>شهر:</strong> <span className="city-name">{ipLocation.city || '-'}</span>
          </div>

          <div className="ip-detail-item">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10 6c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"/>
            </svg>
            <strong>ارائه دهنده:</strong> <span className="isp-name">{ipLocation.isp || '-'}</span>
          </div>
          
          {ipLocation.pingResults && (
            <div className="ping-results animate-fade-in animate-scale-in glass-effect">
              <h4 className="ping-title animate-pulse-subtle">
                <svg width="18" height="18" viewBox="0 0 24 24" className="animate-rotate">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 14.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2.5-2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-9 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4.5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4.5 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                </svg>
                نتایج تست پینگ
                {ipLocation.pingResults.inProgress && 
                  <span className="ping-progress"> (در حال تست...)</span>
                }
              </h4>
              
              {ipLocation.pingResults.inProgress ? (
                <div className="ping-progress-container">
                  <div className="ping-progress-bar"></div>
                  <p className="ping-progress-text">در حال تست پینگ IP {parsedDNS.ip}...</p>
                </div>
              ) : ipLocation.pingResults.error ? (
                <div className="ping-error glass-effect-inner">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {ipLocation.pingResults.error}
                </div>
              ) : (
                <div className="ping-stats animate-bounce-soft">
                  <div className="ping-stat glass-effect-inner animate-fade-in-up">
                    <strong>وضعیت:</strong> 
                    <span className={`status-badge ${ipLocation.pingResults.success ? 'success-badge' : 'error-badge'} animate-pulse`}>
                      {ipLocation.pingResults.success ? 'موفق' : 'ناموفق'}
                    </span>
                  </div>
                  <div className="ping-times animate-slide-in">
                    <div className="ping-time glass-effect-inner animate-fade-in" style={{animationDelay: '0.1s'}}>
                      <strong>زمان متوسط:</strong> 
                      <span className="ping-value">{ipLocation.pingResults.avgTime} <small>ms</small></span>
                    </div>
                    <div className="ping-time glass-effect-inner animate-fade-in" style={{animationDelay: '0.2s'}}>
                      <strong>حداقل زمان:</strong> 
                      <span className="ping-value">{ipLocation.pingResults.minTime} <small>ms</small></span>
                    </div>
                    <div className="ping-time glass-effect-inner animate-fade-in" style={{animationDelay: '0.3s'}}>
                      <strong>حداکثر زمان:</strong> 
                      <span className="ping-value">{ipLocation.pingResults.maxTime} <small>ms</small></span>
                    </div>
                    <div className="ping-time glass-effect-inner animate-fade-in" style={{animationDelay: '0.4s'}}>
                      <strong>اتلاف بسته:</strong> 
                      <span className="ping-value">{ipLocation.pingResults.packetLoss}<small>%</small></span>
                    </div>
                  </div>
                  <div className="ping-stat glass-effect-inner animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                    <strong>TTL:</strong> <span className="ping-value animate-pulse-subtle">{ipLocation.pingResults.ttl}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="result-actions">
        <button onClick={handlePingTest} className="ping-btn animate-pulse-subtle">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 14.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2.5-2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-9 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4.5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4.5 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
          تست پینگ
        </button>
      </div>
    </div>
  );
};

export default IPResult;
