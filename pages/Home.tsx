
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, ShieldCheck, Zap, Globe, Smartphone } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-10">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Military Grade Security
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          Securely create and share <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            encrypted messages
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Zero-knowledge, client-side encryption suite. Your data never leaves your device unencrypted. 
          The modern standard for private communication.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/encrypt"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <Lock className="w-5 h-5" />
            Create Encrypted Message
          </Link>
          <Link
            to="/decrypt"
            className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Unlock className="w-5 h-5" />
            Unlock Message
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6" />}
          title="Zero Logging"
          description="We don't store your messages or keys. Encryption happens entirely in your browser."
        />
        <FeatureCard 
          icon={<Zap className="w-6 h-6" />}
          title="Instant Processing"
          description="Powered by high-performance cryptographic libraries for blazing fast encryption/decryption."
        />
        <FeatureCard 
          icon={<Globe className="w-6 h-6" />}
          title="Open Standard"
          description="Uses industry-standard AES-256-GCM and ChaCha20 algorithms trusted worldwide."
        />
        <FeatureCard 
          icon={<Smartphone className="w-6 h-6" />}
          title="Mobile First"
          description="Optimized for touch interfaces and small screens without sacrificing security."
        />
        <FeatureCard 
          icon={<Lock className="w-6 h-6" />}
          title="Auto-Destruct"
          description="Create one-time use messages that disappear from memory once the browser is closed."
        />
        <FeatureCard 
          icon={<Unlock className="w-6 h-6" />}
          title="Universal Support"
          description="Full Unicode, emoji, and multi-language support for global private messaging."
        />
      </section>
    </div>
  );
}
