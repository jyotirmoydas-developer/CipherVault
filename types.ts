
export enum EncryptionAlgorithm {
  AES_256 = 'AES-256',
  CHACHA20 = 'ChaCha20',
  TRIPLE_DES = 'TripleDES'
}

export interface EncryptedPayload {
  data: string;
  algorithm: EncryptionAlgorithm;
  timestamp: number;
}
