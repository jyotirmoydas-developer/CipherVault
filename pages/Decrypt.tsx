
import React, { useState, useEffect, useRef } from 'react';
import { 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  AlertCircle,
  ShieldQuestion,
  QrCode,
  X,
  Camera,
  ShieldAlert,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { EncryptionAlgorithm } from '../types';
import { decryptMessage, checkPasswordStrength } from '../services/cryptoUtils';
import { Html5Qrcode } from 'html5-qrcode';

export default function Decrypt() {
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [algo, setAlgo] = useState<EncryptionAlgorithm>(EncryptionAlgorithm.AES_256);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);
  
  // QR Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [isDecoded, setIsDecoded] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const SCANNER_ID = "qr-reader-region";

  useEffect(() => {
    setStrength(checkPasswordStrength(key));
  }, [key]);

  const handleDecrypt = () => {
    setError('');
    setResult('');
    
    const cleanCipher = ciphertext.trim();
    if (!cleanCipher) {
      setError("Input Required: Please paste the encrypted text you want to unlock.");
      return;
    }
    if (!key) {
      setError("Key Missing: Decryption requires the secret password used to lock the message.");
      return;
    }

    try {
      const decrypted = decryptMessage(cleanCipher, key, algo);
      setResult(decrypted);
    } catch (err: any) {
      setError(err.message || "Decryption failed: An unexpected error occurred.");
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setIsDecoded(false);
    setScannerError('');
    
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.7);
              return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0
          },
          (decodedText) => {
            setIsDecoded(true);
            setCiphertext(decodedText);
            // Brief pause to show success indicator before closing
            setTimeout(() => {
              stopScanner();
            }, 800);
          },
          (errorMessage) => {
            // Silence common scanning noise
          }
        );
      } catch (err: any) {
        console.error("Scanner startup error:", err);
        let msg = "Camera Access Failed: Please grant camera permissions to use the scanner.";
        if (err.name === "NotReadableError" || err.message?.includes("in use")) {
          msg = "Camera in use: Another application is currently using your camera.";
        }
        setScannerError(msg);
      }
    }, 100);
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        // 2 is the value for Html5QrcodeScannerState.SCANNING
        if (scanner.getState() === 2) {
          await scanner.stop();
        }
      } catch (err) {
        // Catch the error to prevent blocking the UI from closing
        console.warn("Scanner stop warning (likely DOM node already gone):", err);
      } finally {
        scannerRef.current = null;
      }
    }
    // Only set isScanning to false AFTER attempting to stop/clear
    // to ensure the DOM node with SCANNER_ID stays present during cleanup.
    setIsScanning(false);
    setIsDecoded(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScannerError('');
    // For file scanning, we can use a temporary instance
    const html5QrCode = new Html5Qrcode(SCANNER_ID, false);
    
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      setCiphertext(decodedText);
      setIsDecoded(true);
      setTimeout(() => {
        stopScanner();
      }, 500);
    } catch (err: any) {
      console.error("File scan error:", err);
      setScannerError("Invalid QR Code: Could not detect an encrypted message in this image.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCiphertext('');
    setKey('');
    setResult('');
    setError('');
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

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      const scanner = scannerRef.current;
      if (scanner && scanner.getState() === 2) {
        scanner.stop().catch(err => console.error("Cleanup stop error:", err));
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-indigo-600/20 rounded-lg">
          <Unlock className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Decrypt Message</h2>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-6">
        {/* Ciphertext Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300 block">Encrypted Content (Ciphertext)</label>
            <button 
              onClick={startScanner}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
            >
              <QrCode className="w-3.5 h-3.5" />
              Scanner Mode
            </button>
          </div>
          <textarea
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            placeholder="Paste your encrypted message here or use the scanner..."
            className={`w-full h-32 bg-slate-900 border ${error.includes('Malformed') || error.includes('Input Required') ? 'border-red-500/50' : 'border-slate-800'} rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 resize-none`}
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
              <option value={EncryptionAlgorithm.AES_256}>AES-256 (Default)</option>
              <option value={EncryptionAlgorithm.CHACHA20}>ChaCha20</option>
              <option value={EncryptionAlgorithm.TRIPLE_DES}>TripleDES</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Secret Key / Password</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter decryption password..."
                className={`w-full bg-slate-900 border ${error.includes('Key Missing') || error.includes('Incorrect key') ? 'border-red-500/50' : 'border-slate-800'} rounded-xl pl-4 pr-12 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
                  <span>Input Strength</span>
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

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleDecrypt}
            className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            Decrypt Message
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

      {/* QR Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Camera className="w-5 h-5 text-indigo-400" />
                QR Scanner
              </div>
              <button 
                onClick={stopScanner}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-square shadow-inner group">
                {/* Visual Feedback Overlays */}
                <div className={`absolute inset-0 z-10 pointer-events-none border-[40px] transition-colors duration-300 ${isDecoded ? 'border-green-500/40' : 'border-slate-900/40'}`}></div>
                <div className="absolute inset-[40px] z-10 pointer-events-none">
                  {!isDecoded && <div className="scanner-laser"></div>}
                  <div className={`scanner-frame transition-colors duration-300 ${isDecoded ? 'border-green-500' : 'border-indigo-500/30'}`}></div>
                  <div className={`scanner-corner corner-tl transition-colors duration-300 ${isDecoded ? 'border-green-500' : 'border-indigo-500'}`}></div>
                  <div className={`scanner-corner corner-tr transition-colors duration-300 ${isDecoded ? 'border-green-500' : 'border-indigo-500'}`}></div>
                  <div className={`scanner-corner corner-bl transition-colors duration-300 ${isDecoded ? 'border-green-500' : 'border-indigo-500'}`}></div>
                  <div className={`scanner-corner corner-br transition-colors duration-300 ${isDecoded ? 'border-green-500' : 'border-indigo-500'}`}></div>
                </div>

                {/* Success Overlay Indicator */}
                {isDecoded && (
                  <div className="absolute inset-0 z-20 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white rounded-full p-4 shadow-xl shadow-green-500/40 animate-in zoom-in duration-300">
                      <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                    </div>
                  </div>
                )}

                <div id={SCANNER_ID} className="w-full h-full"></div>
                
                {/* Fallback Label if camera is slow to load */}
                {!scannerRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-sm">
                    Initializing camera...
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {scannerError ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{scannerError}</p>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 text-xs px-4">
                    Position the QR code within the highlighted frame to automatically capture the message.
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-grow bg-slate-800"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">or</span>
                    <div className="h-px flex-grow bg-slate-800"></div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDecoded}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    Upload QR Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {result && (
        <div className="glass-panel rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-300 border-green-500/30 shadow-2xl shadow-green-500/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Decrypted Message
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
            <p className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed selection:bg-green-500/30">
              {result}
            </p>
          </div>
        </div>
      )}

      {/* Guidance */}
      {!result && !error && (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 text-slate-500 bg-slate-900/30">
          <ShieldQuestion className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-400" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Troubleshooting:</p>
            <p>Decryption requires exactly the same <strong>algorithm</strong> and <strong>key</strong> as the original encryption. If you're scanning a QR, CipherVault will automatically try to read the data.</p>
          </div>
        </div>
      )}
    </div>
  );
}
