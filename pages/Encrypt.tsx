
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Trash2, 
  QrCode,
  AlertCircle,
  ShieldAlert,
  Download,
  Clock,
  Timer
} from 'lucide-react';
import { EncryptionAlgorithm } from '../types';
import { encryptMessage, generateStrongKey, checkPasswordStrength } from '../services/cryptoUtils';

const EXPIRATION_OPTIONS = [
  { label: '5 Minutes', value: 5 * 60 * 1000 },
  { label: '1 Hour', value: 60 * 60 * 1000 },
  { label: '12 Hours', value: 12 * 60 * 60 * 1000 },
  { label: '1 Day', value: 24 * 60 * 60 * 1000 },
  { label: '7 Days', value: 7 * 24 * 60 * 60 * 1000 },
];

export default function Encrypt() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [algo, setAlgo] = useState<EncryptionAlgorithm>(EncryptionAlgorithm.AES_256);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);
  const [canShare, setCanShare] = useState(false);
  
  // Expiration states
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [expiryDuration, setExpiryDuration] = useState(EXPIRATION_OPTIONS[1].value); // Default 1 hour
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setStrength(checkPasswordStrength(key));
  }, [key]);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  // Timer logic for expiration
  useEffect(() => {
    if (!expiryTimestamp || !result) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expiryTimestamp - now;

      if (diff <= 0) {
        handleClear();
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        let timeString = '';
        if (hours > 0) timeString += `${hours}h `;
        timeString += `${minutes}m ${seconds}s`;
        setTimeLeft(timeString);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTimestamp, result]);

  const handleEncrypt = () => {
    setError('');
    setResult('');
    setExpiryTimestamp(null);
    
    if (!message.trim()) {
      setError("Input Error: Your message cannot be empty.");
      return;
    }
    if (!key) {
      setError("Security Error: A decryption key is required to secure your message.");
      return;
    }
    if (key.length < 4) {
      setError("Weak Key: Please use a password with at least 4 characters for basic safety.");
      return;
    }

    try {
      const encrypted = encryptMessage(message, key, algo);
      setResult(encrypted);
      
      if (enableExpiration) {
        setExpiryTimestamp(Date.now() + expiryDuration);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during encryption.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Secure Message from CipherVault',
          text: result,
        });
      } catch (err) {
        console.error('Error sharing text:', err);
      }
    }
  };

  const handleShareQR = async () => {
    if (!qrCanvasRef.current || !navigator.share) return;

    try {
      const canvas = qrCanvasRef.current;
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Could not generate image blob");

      const file = new File([blob], "ciphervault-qr.png", { type: "image/png" });
      
      const shareData = {
        title: 'CipherVault Secure QR',
        text: 'Encrypted message QR code from CipherVault.',
        files: [file]
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const link = document.createElement('a');
        link.download = 'ciphervault-qr.png';
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  const handleClear = () => {
    setMessage('');
    setKey('');
    setResult('');
    setStrength(0);
    setError('');
    setShowQR(false);
    setExpiryTimestamp(null);
    setTimeLeft('');
  };

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Moderate';
    return 'Strong';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-indigo-600/20 rounded-lg">
          <Lock className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Encrypted Message</h2>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-6">
        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 block">Your Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your sensitive message here..."
            className={`w-full h-32 bg-slate-900 border ${error.includes('Input') ? 'border-red-500/50' : 'border-slate-800'} rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 resize-none`}
          />
        </div>

        {/* Algorithm & Key Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Encryption Algorithm</label>
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as EncryptionAlgorithm)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
            >
              <option value={EncryptionAlgorithm.AES_256}>AES-256 (Secure Default)</option>
              <option value={EncryptionAlgorithm.CHACHA20}>ChaCha20 (Mobile Fast)</option>
              <option value={EncryptionAlgorithm.TRIPLE_DES}>TripleDES (Legacy)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Secret Key / Password</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter password..."
                className={`w-full bg-slate-900 border ${error.includes('Key') ? 'border-red-500/50' : 'border-slate-800'} rounded-xl pl-4 pr-12 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={() => setKey(generateStrongKey())}
                  className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Generate Strong Key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {key && (
              <div className="space-y-1 mt-2 animate-in fade-in duration-300">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Password Strength</span>
                  <span className={strength < 40 ? 'text-red-400' : strength < 80 ? 'text-yellow-400' : 'text-green-400'}>
                    {getStrengthText()} ({strength}%)
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expiration Settings */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">Enable Message Expiration</span>
            </div>
            <button
              onClick={() => setEnableExpiration(!enableExpiration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enableExpiration ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableExpiration ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          {enableExpiration && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Self-Destruct After:</label>
              <div className="flex flex-wrap gap-2">
                {EXPIRATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setExpiryDuration(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${expiryDuration === opt.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 italic">
                * Note: Expiration only applies to this current session results. Message data will be cleared from the UI and memory when the timer ends.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleEncrypt}
            className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            Encrypt Message
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Result Panel */}
      {result && (
        <div className="glass-panel rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-300 border-indigo-500/30 shadow-2xl shadow-indigo-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Encryption Successful</h3>
              {expiryTimestamp && (
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                  <Timer className="w-3 h-3" />
                  Expires in: <span className="font-mono">{timeLeft}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {canShare && (
                <button
                  onClick={handleShareText}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
                  title="Share encrypted text"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden xs:inline text-sm">Share Text</span>
                </button>
              )}
              <button
                onClick={() => setShowQR(!showQR)}
                className={`p-2 rounded-lg transition-all ${showQR ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Toggle QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="relative group">
            <textarea
              readOnly
              value={result}
              className="w-full h-32 bg-indigo-950/20 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-200 font-mono text-sm resize-none focus:outline-none"
            />
          </div>

          {showQR && (
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="relative p-4 border border-slate-200 rounded-xl bg-white shadow-inner">
                <QRCodeCanvas 
                  ref={qrCanvasRef}
                  value={result} 
                  size={200} 
                  level="M" 
                  includeMargin={true}
                />
              </div>
              
              <div className="flex gap-3 w-full max-w-xs">
                {canShare && (
                  <button
                    onClick={handleShareQR}
                    className="flex-grow flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-md shadow-indigo-500/20"
                  >
                    <Share2 className="w-4 h-4" />
                    Share QR
                  </button>
                )}
                <button
                  onClick={() => {
                    if (qrCanvasRef.current) {
                      const link = document.createElement('a');
                      link.download = 'ciphervault-qr.png';
                      link.href = qrCanvasRef.current.toDataURL();
                      link.click();
                    }
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save
                </button>
              </div>

              <p className="text-slate-900 text-[10px] font-bold text-center uppercase tracking-widest opacity-60">
                Scan with any QR reader to extract ciphertext
              </p>
            </div>
          )}

          <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
            <p className="text-xs text-slate-400 italic leading-relaxed">
              <strong>Security Tip:</strong> Share this ciphertext or QR with your recipient via any channel. 
              Only someone with the secret key and knowledge of the algorithm ({algo}) can read it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
