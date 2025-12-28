import React, { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, User } from 'lucide-react';

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  score?: number;
}

const UsernameForm: React.FC<UsernameFormProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  score
}) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      setLocalError(t('auth.usernameTooShort'));
      return;
    }
    if (trimmedUsername.length > 20) {
      setLocalError(t('auth.usernameTooLong', 'Username must be at most 20 characters'));
      return;
    }
    // Only allow letters, numbers, and Danish characters
    if (!/^[a-zA-Z0-9æøåÆØÅ_-]+$/.test(trimmedUsername)) {
      setLocalError(t('auth.usernameInvalidChars', 'Username can only contain letters, numbers, _ and -'));
      return;
    }

    onSubmit(trimmedUsername);
  };

  const displayError = localError || errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {score !== undefined && (
        <div className="text-center mb-4">
          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('auth.yourScore', { score })}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t('auth.enterUsername')}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.usernamePlaceholder')}
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('auth.usernamePlaceholder')}
            autoFocus
            maxLength={20}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-all duration-200 text-gray-900 placeholder-gray-400 text-lg"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {t('auth.usernameHint', '2-20 characters, letters and numbers')}
        </p>
      </div>

      {displayError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{displayError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || username.trim().length < 2}
        className="w-full flex items-center justify-center gap-2 py-3 px-4
          bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
          text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
          transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t('auth.saving')}
          </>
        ) : (
          t('auth.save')
        )}
      </button>
    </form>
  );
};

export default UsernameForm;
