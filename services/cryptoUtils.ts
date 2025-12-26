
import CryptoJS from 'crypto-js';
import { EncryptionAlgorithm } from '../types';

export const generateStrongKey = (length: number = 32): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const encryptMessage = (message: string, key: string, algo: EncryptionAlgorithm): string => {
  try {
    let encrypted: CryptoJS.lib.CipherParams;
    
    switch (algo) {
      case EncryptionAlgorithm.AES_256:
        encrypted = CryptoJS.AES.encrypt(message, key);
        break;
      case EncryptionAlgorithm.CHACHA20:
        encrypted = CryptoJS.Rabbit.encrypt(message, key);
        break;
      case EncryptionAlgorithm.TRIPLE_DES:
        encrypted = CryptoJS.TripleDES.encrypt(message, key);
        break;
      default:
        encrypted = CryptoJS.AES.encrypt(message, key);
    }
    
    const result = encrypted.toString();
    if (!result) throw new Error("Encryption resulted in empty output.");
    return result;
  } catch (error: any) {
    console.error("Encryption failed:", error);
    throw new Error(`Encryption failed: ${error.message || "Invalid input or internal error."}`);
  }
};

export const decryptMessage = (ciphertext: string, key: string, algo: EncryptionAlgorithm): string => {
  // Basic pre-validation for base64-like structure common in CryptoJS output
  if (!/^[a-zA-Z0-9+/=]+$/.test(ciphertext.trim())) {
    throw new Error("Malformed ciphertext: The input contains invalid characters for an encrypted message.");
  }

  try {
    let bytes: CryptoJS.lib.WordArray;
    
    switch (algo) {
      case EncryptionAlgorithm.AES_256:
        bytes = CryptoJS.AES.decrypt(ciphertext, key);
        break;
      case EncryptionAlgorithm.CHACHA20:
        bytes = CryptoJS.Rabbit.decrypt(ciphertext, key);
        break;
      case EncryptionAlgorithm.TRIPLE_DES:
        bytes = CryptoJS.TripleDES.decrypt(ciphertext, key);
        break;
      default:
        bytes = CryptoJS.AES.decrypt(ciphertext, key);
    }
    
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryptedText is empty, it almost always means the key was wrong 
    // or the data doesn't match the algorithm structure.
    if (!decryptedText) {
      throw new Error("Decryption failed: Incorrect key, wrong algorithm selected, or the message is corrupted.");
    }
    
    return decryptedText;
  } catch (error: any) {
    // If it throws during decryption (e.g. padding error), it's a format issue or wrong key
    if (error.message && error.message.includes("Decryption failed")) {
      throw error;
    }
    console.error("Internal Decryption error:", error);
    throw new Error("Decryption failed: The ciphertext format is incompatible with the selected algorithm.");
  }
};

export const checkPasswordStrength = (password: string): number => {
  let strength = 0;
  if (!password) return 0;
  if (password.length > 8) strength += 20;
  if (password.length > 12) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  return strength;
};
