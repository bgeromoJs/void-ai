'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Infinity as InfinityIcon, 
  Cpu, 
  Shield, 
  Zap, 
  ChevronRight, 
  LayoutDashboard,
  Lock,
  Star,
  Globe,
  ArrowRight
} from 'lucide-react';
import GalaxyBackground from '@/components/GalaxyBackground';
import Link from 'next/link';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('infinito_user');
    if (user) {
      // Use a microtask to avoid synchronous setState in effect
      Promise.resolve().then(() => setIsLoggedIn(true));
    }
  }, []);

  return (
    <div className="min-h-screen relative text-white selection:bg-violet-500/30">
      <GalaxyBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <InfinityIcon className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tighter">INFINITO AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#agents" className="hover:text-white transition-colors">Agentes</a>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link 
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
              >
                Dashboard <LayoutDashboard className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">Login</Link>
                <Link 
                  href="/login?signup=true"
                  className="px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                >
                  Começar Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold tracking-widest uppercase mb-8">
              <Star className="w-3 h-3 fill-current" /> O Futuro da Automação
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              Gerencie seus <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
                Agentes Infinitos
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              A primeira plataforma de orquestração de agentes de IA com gravidade zero. 
              Conecte Gemini, GPT e modelos locais em um único ecossistema galáctico.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 group"
              >
                Explorar Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-colors">
                Ver Demonstração
              </button>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
            {[
              {
                icon: <Cpu className="w-6 h-6 text-violet-400" />,
                title: "Multi-Modelo",
                desc: "Alterne entre Gemini 1.5 Pro, Flash e outros modelos com um clique."
              },
              {
                icon: <Shield className="w-6 h-6 text-indigo-400" />,
                title: "Segurança Orbital",
                desc: "Seus dados são criptografados e protegidos por camadas de segurança avançada."
              },
              {
                icon: <Zap className="w-6 h-6 text-cyan-400" />,
                title: "Velocidade da Luz",
                desc: "Processamento em tempo real com latência mínima para seus agentes."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planos de Assinatura</h2>
            <p className="text-white/60">Escolha a órbita ideal para o seu negócio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Nebulosa</h3>
                <p className="text-white/50 text-sm">Para exploradores iniciantes</p>
              </div>
              <div className="text-5xl font-bold mb-8">Grátis</div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-violet-400" />
                  </div>
                  1 Agente Ativo
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-violet-400" />
                  </div>
                  Modelos Flash (Gemini Flash)
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-violet-400" />
                  </div>
                  100 Mensagens/Dia
                </li>
              </ul>
              <Link 
                href="/login"
                className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 font-bold hover:bg-white/20 transition-colors text-center"
              >
                Começar Agora
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-10 rounded-[2.5rem] bg-gradient-to-b from-violet-600/20 to-indigo-600/20 border border-violet-500/30 relative overflow-hidden flex flex-col">
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-violet-500 text-[10px] font-bold tracking-widest uppercase">Popular</div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Supernova</h3>
                <p className="text-white/50 text-sm">Para agências e power users</p>
              </div>
              <div className="text-5xl font-bold mb-8">R$ 99<span className="text-xl text-white/50 font-normal">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  Agentes Ilimitados
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  Modelos Pro (Gemini 1.5 Pro)
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  Mensagens Ilimitadas
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  API Access & Webhooks
                </li>
              </ul>
              <button className="w-full py-4 rounded-2xl bg-violet-600 font-bold hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/30">
                Assinar Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <InfinityIcon className="w-5 h-5" />
            <span className="font-bold tracking-tighter">INFINITO AI</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
          <p className="text-xs text-white/20">© 2026 Infinito AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
