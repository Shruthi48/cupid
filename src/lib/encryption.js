// Using AES encryption from CryptoJS
import CryptoJS from 'crypto-js';

// Generate a unique key for each chat based on the two user IDs
export function generateChatKey(userId1, userId2) {
    // Sort IDs to ensure same key regardless of order
    const sortedIds = [userId1, userId2].sort();
    return sortedIds.join('_');
}

// Encrypt message
export function encryptMessage(message, chatKey) {
    try {
        const encrypted = CryptoJS.AES.encrypt(message, chatKey).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return message;
    }
}

// Decrypt message
export function decryptMessage(encryptedMessage, chatKey) {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedMessage, chatKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedMessage;
    }
}
