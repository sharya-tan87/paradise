const crypto = require('crypto');

/**
 * Generate a cryptographically secure random integer
 * @param {number} max - Upper bound (exclusive)
 * @returns {number} - Random integer from 0 to max-1
 */
function secureRandomInt(max) {
    return crypto.randomInt(0, max);
}

/**
 * Cryptographically secure Fisher-Yates shuffle
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function secureShuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Generate a cryptographically secure random temporary password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Random password
 */
function generateTempPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    // Ensure at least one of each type using crypto.randomInt
    let password = '';
    password += uppercase.charAt(secureRandomInt(uppercase.length));
    password += lowercase.charAt(secureRandomInt(lowercase.length));
    password += numbers.charAt(secureRandomInt(numbers.length));
    password += symbols.charAt(secureRandomInt(symbols.length));

    // Fill rest with random chars using crypto.randomInt
    for (let i = 4; i < length; i++) {
        password += allChars.charAt(secureRandomInt(allChars.length));
    }

    // Cryptographically secure shuffle
    return secureShuffle(password.split('')).join('');
}

module.exports = { generateTempPassword };
