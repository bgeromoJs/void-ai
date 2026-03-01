'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Infinity as InfinityIcon, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import GalaxyBackground from '@/components/GalaxyBackground';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate auth
    setTimeout(() => {
      localStorage.setItem('infinito_user', JSON.stringify({ email, name: email.split('@')[0] }));
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GalaxyBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-[2.5rem] glass relative overflow-hidden"
      >
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-600/40 mb-6">
            <InfinityIcon className="w-10 h-10 text-white" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Infinito</h1>
          <p className="text-white/50 text-sm mt-2">Acesse sua central de agentes</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-violet-600 font-bold hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Conectando..." : "Entrar na Órbita"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px flex-grow bg-white/10"></div>
          <span className="text-xs text-white/30 font-bold uppercase">Ou continue com</span>
          <div className="h-px flex-grow bg-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Github className="w-5 h-5" />
            <span className="text-sm font-medium">Github</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Chrome className="w-5 h-5" />
            <span className="text-sm font-medium">Google</span>
          </button>
        </div>

        <p className="text-center text-sm text-white/40 mt-8">
          Não tem uma conta? <Link href="/login?signup=true" className="text-violet-400 hover:text-violet-300 font-bold">Criar conta</Link>
        </p>
      </motion.div>
    </div>
  );
}
