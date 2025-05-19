
import React from 'react';

const CountrySelector = ({ selectedCountry, setSelectedCountry, countries, isLoading }) => {
  // تبدیل کد کشور به کد برای استفاده در API پرچم
  const getCountryCode = (countryName) => {
    const countryCodes = {
      'ایران': 'IR',
      'آلمان': 'DE',
      'آمریکا': 'US',
      'ترکیه': 'TR',
      'روسیه': 'RU',
      'امارات': 'AE',
      // کدهای کشور را می‌توان اینجا اضافه کرد
    };

    return countryCodes[countryName] || '';
  };

  return (
    <div className="form-group">
      <label>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        انتخاب کشور
      </label>
      <div className="select-container">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          disabled={isLoading}
          className="country-select"
        >
          {Object.keys(countries).map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <div className="select-flag">
          <img 
            src={`https://flagcdn.com/w20/${getCountryCode(selectedCountry).toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${getCountryCode(selectedCountry).toLowerCase()}.png 2x`}
            width="20"
            className="flag-icon-select"
            alt={selectedCountry}
          />
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;
