import CryptoJS from 'crypto-js';

export const encryptAES = (text: string, password: string): string => {
    return CryptoJS.AES.encrypt(text, password).toString();
};

export const decryptAES = (cipherText: string, password: string): string => {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    return bytes.toString(CryptoJS.enc.Utf8);
};
