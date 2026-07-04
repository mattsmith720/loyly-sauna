/** Strip common formatting so AU numbers can be validated consistently. */
export function normalizePhoneInput(phone: string): string {
  return phone.trim().replace(/[\s().-]/g, "");
}

/** Accepts domestic (0…) and +61 international Australian numbers. */
export function isValidAuPhone(phone: string): boolean {
  const normalized = normalizePhoneInput(phone);

  if (/^0[23478]\d{8}$/.test(normalized)) return true;
  if (/^\+?61[23478]\d{8}$/.test(normalized)) return true;

  return false;
}
