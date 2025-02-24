/**
 * @description Returns true if the provided phone number (Indian) is valid or not
 * @param phoneNumber {string} - The phone number to validate
 * @returns boolean
 */
export const validPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) {
    return false;
  }

  if (phoneNumber.length !== 10) {
    return false;
  }

  if (!/^\d+$/.test(phoneNumber)) {
    return false;
  }

  return true;
};
