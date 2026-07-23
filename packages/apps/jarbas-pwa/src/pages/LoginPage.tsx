import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useIdentityStore } from '../store/identityStore';
import { StarAvatar } from '../components/StarAvatar';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const { assistantName } = useIdentityStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    try {
      if (isRegister) {
        await register(email, password, name, tenantId || 'default');
      } else {
        await login(email, password);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <StarAvatar state="idle" size={88} />
          </div>
          <h1 className="text-3xl font-bold text-gradient uppercase">{assistantName}</h1>
          <p className="text-dark-400 mt-2 text-sm">AI Orchestration Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                required
                autoComplete="name"
              />
              <input
                type="text"
                placeholder="Organização (opcional)"
                value={tenantId}
                onChange={e => setTenantId(e.target.value)}
                className="input-field"
                autoComplete="organization"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field"
            required
            autoComplete="email"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field pr-12"
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {(error || localError) && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
              {error || localError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {isRegister ? 'Criar conta' : 'Entrar'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => { setIsRegister(!isRegister); clearError(); setLocalError(''); }}
          className="w-full mt-6 text-center text-dark-400 hover:text-jarbas-400 text-sm transition-colors"
        >
          {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora'}
        </button>
      </div>
    </div>
  );
}
