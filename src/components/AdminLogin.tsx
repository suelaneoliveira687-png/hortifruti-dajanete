import React, { useState } from 'react';
import { KeyRound, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { JaneteLogo } from './JaneteLogo';

interface AdminLoginProps {
  onLoginSuccess: (email: string, password: string) => Promise<void>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onLoginSuccess(email, password);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setError(code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')
        ? 'E-mail ou senha incorretos.'
        : code.includes('auth/too-many-requests')
        ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        : 'Não foi possível entrar. Verifique a configuração do Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xl shadow-stone-900/5 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <JaneteLogo size={74} />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-stone-900">
            Painel da Janete
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Área restrita para gerenciamento de pedidos em tempo real, estoque e configurações.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              E-mail administrativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="janete@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-emerald-600 font-mono"
              />
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mt-4 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-emerald-600 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all"
          >
            <span>{isSubmitting ? 'Entrando...' : 'Entrar no Painel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-stone-100 text-center text-[11px] text-stone-500">
          Acesso protegido pelo Firebase Authentication
        </div>

      </div>
    </div>
  );
};
