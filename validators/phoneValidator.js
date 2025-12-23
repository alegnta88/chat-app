export const isValidPhone = (phone) => {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone);
};