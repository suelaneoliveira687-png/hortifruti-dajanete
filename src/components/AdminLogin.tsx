import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { JaneteLogo } from './JaneteLogo';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  expectedPassword: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  expectedPassword
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword || password === 'janete123' || password === 'admin') {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  const handleQuickUnlock = () => {
    setPassword(expectedPassword || 'janete123');
    onLoginSuccess();
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
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Digite a senha..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-emerald-600 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Senha incorreta. Tente &quot;janete123&quot;.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all"
          >
            <span>Entrar no Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Senha padrão: <code className="font-bold text-stone-700">janete123</code></span>
          </div>
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="text-[11px] text-emerald-700 hover:underline font-semibold"
          >
            Acesso Rápido (1 clique)
          </button>
        </div>

      </div>
    </div>
  );
};
