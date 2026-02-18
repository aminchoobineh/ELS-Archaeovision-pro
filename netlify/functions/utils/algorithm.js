// الگوریتم تولید کد فعال‌سازی ۶ رقمی از شناسه دستگاه
exports.generateActivationCode = (systemId) => {
  const digitsOnly = systemId.replace(/[^0-9]/g, '');
  let digits = digitsOnly.split('').map(Number);
  
  while (digits.length < 9) {
    digits.push(digits[digits.length - 1]);
  }
  digits = digits.slice(0, 9);
  
  const group1 = digits.slice(0, 3);
  const group2 = digits.slice(3, 6);
  const group3 = digits.slice(6, 9);
  
  const sum1 = group1.reduce((a, b) => a + b, 0) % 10;
  const sum2 = group2.reduce((a, b) => a + b, 0) % 10;
  const sum3 = group3.reduce((a, b) => a + b, 0) % 10;
  
  return `M${sum1}A${sum2}C${sum3}`;
};