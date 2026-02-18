const STORAGE_KEY = 'archaeo_system_id';

/**
 * تولید شناسه پایدار دستگاه با استفاده از مشخصات سخت‌افزاری
 * توسط تیم فرانت‌اند و امنیت
 */
export const generateStableSystemId = (): string => {
  // جمع‌آوری اطلاعات ثابت دستگاه
  const components: (string | number)[] = [
    navigator.language || 'en',
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || 2,
    navigator.platform || 'unknown',
    new Date().getTimezoneOffset(),
  ];

  // تلاش برای دریافت اطلاعات WebGL (اختیاری)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const renderer = gl.getParameter(gl.RENDERER);
      components.push(renderer);
    }
  } catch {
    // ignored
  }

  // ایجاد هش ساده از ترکیب اطلاعات
  const hash = components.join('|');
  let id = '';
  
  for (let i = 0; i < hash.length; i++) {
    id += hash.charCodeAt(i).toString(16);
  }
  
  // فقط ۹ رقم اول با پیشوند ME-
  return `ME-${id.slice(0, 9).toUpperCase()}`;
};

/**
 * دریافت یا ایجاد شناسه دستگاه
 * ذخیره شده در localStorage برای ماندگاری
 */
export const getOrCreateSystemId = (): string => {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    
    if (!id) {
      id = generateStableSystemId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    
    return id;
  } catch (error) {
    // Fallback برای حالت‌های خطا (مثل Private Mode)
    console.warn('Error accessing localStorage:', error);
    return generateStableSystemId();
  }
};