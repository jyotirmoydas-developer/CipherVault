
import React from 'react';
import { ShieldCheck, Lock, Cpu, Database, EyeOff, UserCheck } from 'lucide-react';

const InfoSection = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
  <div className="flex gap-4 p-6 glass-panel rounded-2xl border border-slate-800">
    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 shrink-0">
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{content}</p>
    </div>
  </div>
);

export default function SecurityInfo() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Security Architecture</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          CipherVault is designed with a "Privacy First" mindset. Learn how we protect your data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <InfoSection 
          icon={<Cpu className="w-6 h-6" />}
          title="Client-Side Only Processing"
          content="All cryptographic operations are performed locally in your browser's memory. Your plaintext message and secret key are never transmitted to any server. Even if our website were compromised, the attacker wouldn't have access to your data because it simply never left your device."
        />
        <InfoSection 
          icon={<Lock className="w-6 h-6" />}
          title="Industry Standard Algorithms"
          content="We use AES-256 (Advanced Encryption Standard) with a 256-bit key length, currently the gold standard for symmetric encryption. It's used by governments and financial institutions worldwide. We also support ChaCha20 for superior performance on mobile devices."
        />
        <InfoSection 
          icon={<Database className="w-6 h-6" />}
          title="Zero Data Persistence"
          content="CipherVault is a stateless application. We do not use cookies, tracking pixels, or any database to store your messages. Once you close your browser tab, all session data (including keys and original messages) is wiped from memory."
        />
        <InfoSection 
          icon={<EyeOff className="w-6 h-6" />}
          title="Unicode & Emoji Support"
          content="Our encryption engine handles full UTF-8 encoding. This means you can securely send emojis, non-Latin characters, and complex symbols without risking data corruption during the encryption process."
        />
        <InfoSection 
          icon={<UserCheck className="w-6 h-6" />}
          title="Open & Transparent"
          content="True security relies on open standards, not obscurity. CipherVault uses audited libraries like CryptoJS and standard Web APIs to ensure the math behind your privacy is solid and verifiable."
        />
      </div>

      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Your Privacy is your Right</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          We believe that secure communication should be accessible to everyone. CipherVault is provided free of charge to help users protect their digital sovereignty.
        </p>
      </div>
    </div>
  );
}
