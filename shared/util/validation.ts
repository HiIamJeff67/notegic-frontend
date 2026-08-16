/**
 * ### Check if the given name is valid or not for Notegic API
 * @param name string
 * @returns a boolean value to indicate if given name is valid or not
 * @description A valid name is:
 * - contain at least 1 english letter(no matter upper case or lower case)
 * - contain at least 1 digit (0 - 9)
 * - contain no other characters such as signs, special characters
 * - its length should be at least 6 characters
 * - its length should be at most 16 characters
 * @example test123, or Test123, or TEST123
 */
export const isValidName = function (name: string): boolean {
  const trimName: string = name.replaceAll(" ", "");
  if (trimName === "") return false;
  if (trimName.length < 6 || trimName.length > 16) return false;

  let hasEnglishLetter = false,
    hasDigit = false,
    hasOtherCharacters = false;

  Array.from(name).forEach(l => {
    if (/[a-zA-Z]/.test(l)) hasEnglishLetter = true;
    else if (/[0-9]/.test(l)) hasDigit = true;
    else {
      hasOtherCharacters = true;
      return;
    }
  });

  return hasEnglishLetter && hasDigit && !hasOtherCharacters;
};

/**
 * ### Check if the given email is valid or not for Notegic API
 * @param email string
 * @returns a boolean value to indicate if the given email is valid or not
 * @description A valid email is:
 * - contain exactly 1 '@' sign
 * - contain exactly 1 '.' sign after the '@' sign
 * - contain any characters before '@' sign, between '@' sign and '.' sign, and after '.' sign
 * @example example123@email.com
 */
export const isValidEmail = function (email: string): boolean {
  const trimEmail: string = email.replaceAll(" ", "");
  return trimEmail !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * ### Check if the given password is valid or not for Notegic API
 * @param password string
 * @returns a boolean value to indicate if the given password is valid or not
 * @description A valid password is:
 * - contain at least 1 upper case english letter
 * - contain at least 1 lower case english letter
 * - contain at least 1 digit
 * - contain no empty space
 * - its length should be at least 8 characters
 * - its length should be at most 1024 characters
 * @example Test1234!
 */
export const isValidPassword = function (password: string): boolean {
  if (password.length < 8 || password.length > 1024) return false;

  let hasEmptySpace: boolean = false,
    hasUpperCaseLetter: boolean = false,
    hasLowerCaseLetter: boolean = false,
    hasDigit: boolean = false,
    hasSpecialCharacter: boolean = false;

  Array.from(password).forEach(l => {
    if (/[ ]/.test(l)) {
      hasEmptySpace = true;
      return;
    } else if (/[a-z]/.test(l)) hasLowerCaseLetter = true;
    else if (/[A-Z]/.test(l)) hasUpperCaseLetter = true;
    else if (/[0-9]/.test(l)) hasDigit = true;
    else if (/[`~!@#$%^&*()-_+=]/.test(l)) hasSpecialCharacter = true;
  });

  return (
    !hasEmptySpace &&
    hasUpperCaseLetter &&
    hasLowerCaseLetter &&
    hasDigit &&
    hasSpecialCharacter
  );
};

/**
 * ### Check if the given auth code is valid or not for Notegic API
 * @param authCode string
 * @returns a boolean value to indicate if the given auth code is valid or not
 * @description A valid auth code is:
 * - contain only digits (0 - 9)
 * - its length should be exactly 6 characters
 * @example 123456, or 845690, or 000123
 * @note the range of the auth code is from 000000 to 999999
 */
export const isValidAuthCode = function (authCode: string): boolean {
  return authCode.length === 6 && /[0-9]/.test(authCode);
};
