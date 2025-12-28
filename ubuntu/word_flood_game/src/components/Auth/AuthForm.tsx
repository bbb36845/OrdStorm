import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  isRegister?: boolean;
  onSubmit: (credentials: { email: string; password: string; username?: string }) => void;
  onToggleMode?: () => void;
  errorMessage?: string | null;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isRegister,
  onSubmit,
  onToggleMode,
  errorMessage,
  isLoading
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isRegister) {
      if (password !== confirmPassword) {
        setLocalError("Adgangskoderne matcher ikke");
        return;
      }
      if (password.length < 6) {
        setLocalError("Adgangskoden skal være mindst 6 tegn");
        return;
      }
      if (username.length < 2) {
        setLocalError("Brugernavn skal være mindst 2 tegn");
        return;
      }
      onSubmit({ email, password, username });
    } else {
      onSubmit({ email, password });
    }
  };

  const displayError = localError || errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Brugernavn
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Dit brugernavn"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="din@email.dk"
            required
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              transition-all duration-200 text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Adgangskode
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              transition-all duration-200 text-gray-900 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {isRegister && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Bekræft Adgangskode
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {displayError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{displayError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4
          bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700
          text-white font-semibold rounded-lg shadow-md hover:shadow-lg
          transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {isRegister ? 'Opretter konto...' : 'Logger ind...'}
          </>
        ) : (
          isRegister ? 'Opret Konto' : 'Log Ind'
        )}
      </button>

      {onToggleMode && (
        <p className="text-center text-sm text-gray-600">
          {isRegister ? 'Har du allerede en konto?' : 'Har du ikke en konto?'}{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors"
          >
            {isRegister ? 'Log ind' : 'Opret konto'}
          </button>
        </p>
      )}
    </form>
  );
};

export default AuthForm;
