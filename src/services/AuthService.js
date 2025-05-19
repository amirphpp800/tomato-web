
// خدمات مربوط به احراز هویت

// شبیه‌سازی هش کردن رمز عبور
const hashPassword = (password) => {
  // در یک برنامه واقعی، از الگوریتم هش مناسب استفاده کنید
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0; // تبدیل به عدد صحیح 32 بیتی
  }
  return hash.toString(16);
};

// تولید توکن نشست ایمن‌تر
const generateSessionToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

// کاربران از پیش تعریف شده با رمزهای هش شده
const predefinedUsers = [
  { username: 'admin', passwordHash: hashPassword('admin1234'), role: 'admin' },
  { username: 'user1', passwordHash: hashPassword('pass1234'), role: 'user' },
  { username: 'demo', passwordHash: hashPassword('demo1234'), role: 'user' },
  // اکانت‌های VIP برای فروش
  { username: 'user1000', passwordHash: hashPassword('ip2024vip1'), role: 'vip' },
  { username: 'user2000', passwordHash: hashPassword('ip2024vip2'), role: 'vip' },
  { username: 'user3000', passwordHash: hashPassword('ip2024vip3'), role: 'vip' },
  { username: 'admin2024', passwordHash: hashPassword('admin2024ip'), role: 'admin' }
];

// بررسی اعتبار کاربر
const validateUser = (username, password) => {
  // ابتدا در کاربران از پیش تعریف شده جستجو
  const user = predefinedUsers.find(u => 
    u.username === username && 
    u.passwordHash === hashPassword(password)
  );
  
  // سپس بررسی در کاربران ذخیره شده در localStorage
  if (!user) {
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const localUser = localUsers.find(u => 
      u.username === username && 
      (u.passwordHash === hashPassword(password) || u.password === password)
    );
    
    return localUser;
  }
  
  return user;
};

// تنظیم جلسه برای کاربر
const setUserSession = (username) => {
  const token = generateSessionToken();
  const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 ساعت
  
  localStorage.setItem('user', username);
  localStorage.setItem('sessionToken', token);
  localStorage.setItem('sessionExpiry', expiry.toString());
  
  return { token, expiry };
};

// بررسی اعتبار جلسه
const validateSession = () => {
  const token = localStorage.getItem('sessionToken');
  const savedUser = localStorage.getItem('user');
  const expiry = localStorage.getItem('sessionExpiry');

  if (token && savedUser && expiry) {
    // بررسی منقضی نشدن جلسه
    if (parseInt(expiry) > Date.now()) {
      return {
        isValid: true,
        username: savedUser,
        token
      };
    }
  }
  
  return { isValid: false };
};

// پاک کردن جلسه
const clearSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('sessionExpiry');
};

export {
  hashPassword,
  generateSessionToken,
  predefinedUsers,
  validateUser,
  setUserSession,
  validateSession,
  clearSession
};
