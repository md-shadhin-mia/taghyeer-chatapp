const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}
