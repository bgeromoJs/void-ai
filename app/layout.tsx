import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Infinito AI - Gerenciador de Agentes Galácticos',
  description: 'Plataforma SaaS para gerenciamento de agentes de IA multimodelo com identidade infinita.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="antialiased bg-[#050505] text-white selection:bg-violet-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
