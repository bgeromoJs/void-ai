'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Infinity as InfinityIcon, 
  Plus, 
  Settings, 
  MessageSquare, 
  Zap, 
  LogOut, 
  Search,
  Bot,
  User,
  Send,
  MoreVertical,
  Trash2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import GalaxyBackground from '@/components/GalaxyBackground';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import AgentGraph from '@/components/AgentGraph';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  senderName: string;
  agentId?: string;
  isInternal?: boolean;
}

interface Agent {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  status: 'online' | 'offline';
}

const PRE_REGISTERED_AGENTS = [
  {
    name: 'Analista de Dados',
    model: 'gemini-3-flash-preview',
    systemPrompt: 'Você é um analista de dados sênior. Seja extremamente conciso, direto e use bullet points. Foque em insights rápidos.',
    icon: 'Zap'
  },
  {
    name: 'Escritor Criativo',
    model: 'gemini-3-flash-preview',
    systemPrompt: 'Você é um escritor criativo. Seja breve e impactante. Evite introduções longas.',
    icon: 'Sparkles'
  },
  {
    name: 'Especialista em Código',
    model: 'gemini-3-flash-preview',
    systemPrompt: 'Você é um engenheiro de software. Forneça apenas o código necessário ou explicações curtas e técnicas.',
    icon: 'Cpu'
  },
  {
    name: 'Tradutor Poliglota',
    model: 'gemini-3-flash-preview',
    systemPrompt: 'Você é um tradutor poliglota. Seja direto na tradução e forneça apenas o contexto essencial.',
    icon: 'InfinityIcon'
  }
];

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Explorador Galáctico',
      model: 'gemini-3-flash-preview',
      systemPrompt: 'Você é um assistente especializado em astronomia e exploração espacial.',
      status: 'online',
    }
  ]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['1']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAgentIdForSettings, setActiveAgentIdForSettings] = useState<string | null>(null);
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', model: '', systemPrompt: '' });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [isConsensusMode, setIsConsensusMode] = useState(true);
  const [showInternalDiscussion, setShowInternalDiscussion] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const performSendMessageRef = useRef<any>(null);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('infinito_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const activeAgents = agents.filter(a => selectedAgentIds.includes(a.id));

  useEffect(() => {
    const agentToEdit = agents.find(a => a.id === activeAgentIdForSettings);
    if (agentToEdit) {
      setEditForm({
        name: agentToEdit.name,
        model: agentToEdit.model,
        systemPrompt: agentToEdit.systemPrompt
      });
    }
  }, [activeAgentIdForSettings, agents]);

  const handleLogout = () => {
    localStorage.removeItem('infinito_user');
    router.push('/');
  };

  const toggleAgentSelection = (id: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(id) 
        ? prev.filter(aid => aid !== id) 
        : [...prev, id]
    );
  };

  const addFromTemplate = (template: typeof PRE_REGISTERED_AGENTS[0]) => {
    if (!isPro && agents.length >= 3) {
      alert("Upgrade para Supernova para criar mais agentes!");
      return;
    }
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: template.name,
      model: template.model,
      systemPrompt: template.systemPrompt,
      status: 'online',
    };
    setAgents([...agents, newAgent]);
    setSelectedAgentIds(prev => [...prev, newAgent.id]);
    setIsLibraryOpen(false);
  };

  const createAgent = () => {
    if (!isPro && agents.length >= 3) {
      alert("Upgrade para Supernova para criar mais agentes!");
      return;
    }
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: `Novo Agente ${agents.length + 1}`,
      model: 'gemini-3-flash-preview',
      systemPrompt: 'Você é um assistente prestativo e conciso.',
      status: 'online',
    };
    setAgents([...agents, newAgent]);
    setActiveAgentIdForSettings(newAgent.id);
    setIsEditingAgent(true);
  };

  const deleteAgent = (id: string) => {
    const newAgents = agents.filter(a => a.id !== id);
    setAgents(newAgents);
    setSelectedAgentIds(prev => prev.filter(aid => aid !== id));
  };

  const saveAgentSettings = () => {
    if (!activeAgentIdForSettings) return;
    setAgents(agents.map(a => 
      a.id === activeAgentIdForSettings 
        ? { ...a, ...editForm } 
        : a
    ));
    setIsEditingAgent(false);
  };

  const speak = useCallback((text: string) => {
    if (!speechEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [speechEnabled]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  }, [isListening]);

  const performSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || selectedAgentIds.length === 0 || isTyping) return;

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend, 
      senderName: user?.name || 'Você' 
    };
    
    setMessages(prev => [...prev, userMessage]);
    const originalInput = textToSend;
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      let turnHistory = "";
      
      if (isConsensusMode && selectedAgentIds.length > 1) {
        // Sequential review process
        for (let i = 0; i < selectedAgentIds.length; i++) {
          const agentId = selectedAgentIds[i];
          const agent = agents.find(a => a.id === agentId);
          if (!agent) continue;

          let prompt = "";
          if (i === 0) {
            prompt = `Você é o primeiro a falar no grupo. Analise o seguinte pedido do usuário e inicie a discussão com sua perspectiva (seja conciso): "${originalInput}"`;
          } else if (i === selectedAgentIds.length - 1) {
            prompt = `Você é o último a falar. Com base em toda a discussão anterior:\n${turnHistory}\n\nFinalize a conversa entregando a resposta definitiva, consolidada e CURTA para o usuário sobre o pedido: "${originalInput}". Fale diretamente com o usuário agora.`;
          } else {
            prompt = `A discussão está em andamento. O(s) colega(s) anterior(es) disseram:\n${turnHistory}\n\nContribua para a discussão, refine os pontos de forma breve para o pedido: "${originalInput}"`;
          }

          const response = await ai.models.generateContent({
            model: agent.model,
            contents: [
              ...messages.map(m => ({ 
                role: m.role, 
                parts: [{ text: m.content }] 
              })),
              { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
              systemInstruction: agent.systemPrompt + " Responda de forma extremamente curta e direta."
            }
          });

          const review = response.text || "";
          turnHistory += `\n--- ${agent.name} disse: ---\n${review}\n`;

          // Show internal discussion discretely
          const internalMessage: Message = {
            role: 'assistant',
            content: review,
            senderName: agent.name,
            agentId: agent.id,
            isInternal: true
          };
          setMessages(prev => [...prev, internalMessage]);

          // If it's the last agent, show the final response to the user and SPEAK it
          if (i === selectedAgentIds.length - 1) {
            const finalMessage: Message = { 
              role: 'assistant', 
              content: review,
              senderName: `Consenso (${activeAgents.map(a => a.name).join(', ')})`,
              agentId: 'consensus'
            };
            setMessages(prev => [...prev, finalMessage]);
            speak(review);
          }
        }
      } else {
        // Standard responses with awareness of each other
        for (let i = 0; i < selectedAgentIds.length; i++) {
          const agentId = selectedAgentIds[i];
          const agent = agents.find(a => a.id === agentId);
          if (!agent) continue;

          const contextPrompt = i === 0 
            ? originalInput 
            : `O usuário pediu: "${originalInput}". Seus colegas de grupo já comentaram:\n${turnHistory}\n\nAdicione sua perspectiva de forma concisa, conversando com o grupo se necessário.`;

          const response = await ai.models.generateContent({
            model: agent.model,
            contents: [
              ...messages.map(m => ({ 
                role: m.role, 
                parts: [{ text: m.content }] 
              })),
              { role: 'user', parts: [{ text: contextPrompt }] }
            ],
            config: {
              systemInstruction: agent.systemPrompt + " Responda de forma curta e direta, evitando redundâncias com o que já foi dito."
            }
          });

          const responseText = response.text || "Desculpe, tive um erro na órbita.";
          turnHistory += `\n[${agent.name}]: ${responseText}\n`;

          const assistantMessage: Message = { 
            role: 'assistant', 
            content: responseText,
            senderName: agent.name,
            agentId: agent.id
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          speak(assistantMessage.content);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  }, [selectedAgentIds, isTyping, user, isConsensusMode, agents, messages, activeAgents, speak]);

  const sendMessage = async () => {
    await performSendMessage(input);
  };

  // Ref to store performSendMessage to avoid stale closures in SpeechRecognition callbacks
  useEffect(() => {
    performSendMessageRef.current = performSendMessage;
  }, [performSendMessage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Auto-send voice input
        setTimeout(() => {
          if (performSendMessageRef.current) {
            performSendMessageRef.current(transcript);
          }
        }, 500);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  return (
    <div className="h-screen flex overflow-hidden text-white relative">
      <GalaxyBackground />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-80 glass border-r border-white/5 flex flex-col z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <InfinityIcon className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tighter">INFINITO</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Biblioteca de Agentes"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
            </button>
            <button 
              onClick={createAgent}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Novo Agente"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              placeholder="Buscar agentes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-4 space-y-2">
          {agents.map(agent => (
            <div key={agent.id} className="relative group">
              <button
                onClick={() => toggleAgentSelection(agent.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                  selectedAgentIds.includes(agent.id) 
                    ? 'bg-violet-600 shadow-lg shadow-violet-600/20' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedAgentIds.includes(agent.id) ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-bold text-sm truncate">{agent.name}</div>
                  <div className={`text-[10px] uppercase tracking-widest font-bold ${
                    selectedAgentIds.includes(agent.id) ? 'text-white/60' : 'text-white/30'
                  }`}>
                    {agent.model.split('-')[1]}
                  </div>
                </div>
                {selectedAgentIds.includes(agent.id) && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAgentIdForSettings(agent.id);
                  setIsEditingAgent(true);
                }}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto space-y-4">
          {showGraph && (
            <div className="h-48">
              <AgentGraph 
                agents={agents} 
                selectedAgentIds={selectedAgentIds} 
                userName={user?.name || 'Você'} 
              />
            </div>
          )}
          
          {!isPro && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4 shadow-lg shadow-violet-600/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Upgrade Pro</span>
              </div>
              <p className="text-[10px] text-white/80 mb-3">Desbloqueie agentes ilimitados e modelos avançados.</p>
              <button 
                onClick={() => setIsPro(true)}
                className="w-full py-2 rounded-lg bg-white text-violet-600 text-xs font-bold hover:bg-white/90 transition-colors"
              >
                Assinar Supernova
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <User className="w-4 h-4 text-violet-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{user?.name || 'Usuário'}</div>
                <div className="text-[10px] text-white/40">{isPro ? 'Supernova' : 'Nebulosa'}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col relative z-10 min-w-0 overflow-hidden">
        {selectedAgentIds.length > 0 ? (
          <>
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-black/20 backdrop-blur-md overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 lg:hidden hover:bg-white/5 rounded-lg transition-colors"
                >
                  <InfinityIcon className="w-6 h-6 text-violet-400" />
                </button>
                <div className="flex -space-x-3 overflow-hidden">
                  {activeAgents.map((agent, i) => (
                    <div key={agent.id} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-violet-600 flex items-center justify-center border-2 border-black ring-2 ring-white/5 z-[10-i]">
                      <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  ))}
                  {activeAgents.length > 1 && (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/10 flex items-center justify-center border-2 border-black ring-2 ring-white/5 z-0 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-white/60">+{activeAgents.length}</span>
                    </div>
                  )}
                </div>
          <div className="flex-grow min-w-0">
                  <h2 className="font-bold text-sm lg:text-base truncate">
                    {activeAgents.length === 1 ? activeAgents[0].name : `Grupo: ${activeAgents.length} Agentes`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">
                      {activeAgents.length === 1 ? `Online • ${activeAgents[0].model.split('-')[1]}` : 'Conexão em Grupo Ativa'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0 ml-4">
                {activeAgents.length > 1 && (
                  <button 
                    onClick={() => setIsConsensusMode(!isConsensusMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                      isConsensusMode 
                        ? 'bg-violet-600/20 border-violet-500 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                    title="Modo Consenso: Agentes revisam entre si antes de responder"
                  >
                    <ShieldCheck className={`w-4 h-4 ${isConsensusMode ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Modo Consenso</span>
                  </button>
                )}
                {isConsensusMode && activeAgents.length > 1 && (
                  <button 
                    onClick={() => setShowInternalDiscussion(!showInternalDiscussion)}
                    className={`p-2 lg:p-2.5 rounded-lg lg:rounded-xl border transition-all ${
                      showInternalDiscussion 
                        ? 'bg-violet-600/10 border-violet-500/30 text-violet-400' 
                        : 'bg-white/5 border-white/10 text-white/20 hover:bg-white/10'
                    }`}
                    title={showInternalDiscussion ? "Ocultar Discussão Interna" : "Ver Discussão Interna"}
                  >
                    {showInternalDiscussion ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
                <button 
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-2 lg:p-2.5 rounded-lg lg:rounded-xl border transition-all ${
                    speechEnabled 
                      ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-white/20 hover:bg-white/10'
                  }`}
                  title={speechEnabled ? "Desativar Voz" : "Ativar Voz"}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setMessages([])}
                  className="p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  title="Limpar Conversa"
                >
                  <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 lg:mb-6">
                    <Bot className="w-8 h-8 lg:w-10 lg:h-10 text-violet-400" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2">Inicie a Conversa</h3>
                  <p className="text-white/40 text-xs lg:text-sm">
                    Você está conversando com {activeAgents.length} agente(s). Envie uma mensagem para começar a orquestração.
                  </p>
                </div>
              )}
              
              {messages.map((msg, i) => {
                if (msg.isInternal && !showInternalDiscussion) return null;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 lg:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} ${msg.isInternal ? 'opacity-50 scale-95 origin-left' : ''}`}
                  >
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-violet-600' : msg.isInternal ? 'bg-white/5 border border-white/5' : 'bg-white/10 border border-white/10'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 lg:w-5 lg:h-5" /> : <Bot className={`w-4 h-4 lg:w-5 lg:h-5 ${msg.isInternal ? 'text-white/40' : ''}`} />}
                    </div>
                    <div className={`max-w-[85%] lg:max-w-[70%] p-4 lg:p-5 rounded-2xl lg:rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-violet-600/20 border border-violet-500/30 rounded-tr-none' 
                        : msg.isInternal
                          ? 'bg-white/5 border border-white/5 rounded-tl-none italic text-xs'
                          : 'bg-white/5 border border-white/10 rounded-tl-none'
                    }`}>
                      {(msg.role === 'assistant' || msg.isInternal) && (
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${msg.isInternal ? 'text-white/30' : 'text-violet-400'}`}>
                          {msg.senderName}
                          {msg.isInternal && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px]">Discussão Interna</span>}
                        </div>
                      )}
                      <div className={`prose prose-invert max-w-none ${msg.isInternal ? 'prose-xs text-white/50' : 'prose-xs lg:prose-sm'}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {isTyping && (
                <div className="flex gap-3 lg:gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 lg:p-5 rounded-2xl lg:rounded-3xl rounded-tl-none">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-white" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-white" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 lg:p-8 pt-0">
              <div className="max-w-4xl mx-auto relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isListening ? "Ouvindo..." : "Envie uma mensagem..."}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 pl-4 lg:pl-6 pr-24 lg:pr-28 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all text-xs lg:text-sm ${isListening ? 'border-violet-500 animate-pulse' : ''}`}
                />
                <div className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-lg lg:rounded-xl flex items-center justify-center transition-all ${
                      isListening 
                        ? 'bg-red-500 shadow-lg shadow-red-500/20' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className="w-10 h-10 rounded-lg lg:rounded-xl bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-center text-[8px] lg:text-[10px] text-white/20 mt-3 lg:mt-4 uppercase tracking-widest font-bold">
                Infinito AI pode cometer erros.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="text-center max-w-sm w-full">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-violet-400"
              >
                <InfinityIcon className="w-8 h-8 mx-auto" />
                <span className="block text-[10px] font-bold uppercase tracking-widest mt-2">Abrir Menu</span>
              </button>
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[1.5rem] lg:rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 lg:mb-8">
                <InfinityIcon className="w-10 h-10 lg:w-12 lg:h-12 text-white/20" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Nenhum Agente Selecionado</h2>
              <p className="text-white/40 text-xs lg:text-sm mb-6 lg:mb-8">
                Sua frota de inteligência está em repouso. Selecione ou conecte um novo agente para iniciar.
              </p>
              <button 
                onClick={createAgent}
                className="w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-violet-600 font-bold text-xs lg:text-sm hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Conectar Novo Agente
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Library Modal */}
      <AnimatePresence>
        {isLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLibraryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass rounded-[2.5rem] p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Biblioteca de Agentes</h2>
                  <p className="text-white/40 text-sm">Selecione especialistas pré-configurados.</p>
                </div>
                <button 
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {PRE_REGISTERED_AGENTS.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => addFromTemplate(template)}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-violet-600/10 hover:border-violet-500/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Bot className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="font-bold mb-1">{template.name}</h3>
                    <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">
                      {template.systemPrompt}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Agent Modal */}
      <AnimatePresence>
        {isEditingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingAgent(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass rounded-[2.5rem] p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Configurar Agente</h2>
                <button 
                  onClick={() => setIsEditingAgent(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Nome do Agente</label>
                  <input 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Modelo de IA</label>
                  <select 
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500/50 appearance-none"
                  >
                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Rápido)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Poderoso)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Instrução do Sistema (Prompt)</label>
                  <textarea 
                    value={editForm.systemPrompt}
                    onChange={(e) => setEditForm({ ...editForm, systemPrompt: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => activeAgentIdForSettings && deleteAgent(activeAgentIdForSettings)}
                    className="flex-shrink-0 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={saveAgentSettings}
                    className="flex-grow py-4 rounded-2xl bg-violet-600 font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
