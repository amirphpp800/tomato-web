
// خدمات مربوط به IP
import cidrCountriesData from '../cidr-countries.json';

// تبدیل CIDR به محدوده IP
const cidrToRange = (cidr) => {
  try {
    const [baseIP, prefix] = cidr.split('/');
    const ipParts = baseIP.split('.').map(Number);
    const prefixNum = parseInt(prefix, 10);

    // محاسبه تعداد IP ها
    const numIPs = Math.pow(2, 32 - prefixNum);

    // محاسبه IP های شروع و پایان
    let start = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const end = start + numIPs - 1;

    return { start, end };
  } catch (error) {
    console.error("Error converting CIDR to range:", error);
    return { start: 0, end: 0 };
  }
};

// تولید IP تصادفی از محدوده
const generateRandomIPFromRange = (start, end) => {
  const randomIP = Math.floor(Math.random() * (end - start + 1)) + start;
  return [
    (randomIP >> 24) & 255,
    (randomIP >> 16) & 255,
    (randomIP >> 8) & 255,
    randomIP & 255
  ].join('.');
};

// تولید IP تصادفی برای کشور
const generateRandomIPForCountry = (country) => {
  const countryRanges = cidrCountriesData[country];
  if (!countryRanges || countryRanges.length === 0) return null;

  const randomCIDR = countryRanges[Math.floor(Math.random() * countryRanges.length)];
  const range = cidrToRange(randomCIDR);
  return generateRandomIPFromRange(range.start, range.end);
};

// تبدیل کد کشور به پرچم
const countryCodeToFlag = (countryCode) => {
  if (!countryCode) return '🌐';

  // تبدیل کد دو حرفی کشور به نمادهای نشانگر منطقه‌ای
  const codePoints = [...countryCode.toUpperCase()].map(
    char => 127397 + char.charCodeAt(0)
  );

  return String.fromCodePoint(...codePoints);
};

// گرفتن کد کشور از نام کشور
const getCountryCode = (countryName) => {
  const countryCodes = {
    'ایران': 'IR',
    'آلمان': 'DE',
    'آمریکا': 'US',
    'ترکیه': 'TR',
    'روسیه': 'RU',
    'امارات': 'AE',
    // اضافه کردن موارد بیشتر در صورت نیاز
  };

  return countryCodes[countryName] || '';
};

// دریافت اطلاعات مکانی IP
const fetchIPLocationData = async (ip) => {
  try {
    const response = await fetch(`https://api.iplocation.net/?ip=${ip}`);
    if (!response.ok) {
      throw new Error('Failed to fetch IP data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching IP location:", error);
    return null;
  }
};

export {
  generateRandomIPForCountry,
  countryCodeToFlag,
  getCountryCode,
  fetchIPLocationData,
  cidrCountriesData
};
