import React, { useState, ChangeEvent, FormEvent } from 'react';

interface AuthFormProps {
  isRegister?: boolean;
  onSubmit: (credentials: { username: string; password?: string }) => void;
  onToggleMode?: () => void;
  errorMessage?: string | null;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegister, onSubmit, onToggleMode, errorMessage, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      alert("Adgangskoderne matcher ikke!");
      return;
    }
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Brugernavn
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Adgangskode
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>
      {isRegister && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Bekræft Adgangskode
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        </div>
      )}
      {errorMessage && (
        <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400"
      >
        {isLoading ? (isRegister ? 'Registrerer...' : 'Logger ind...') : (isRegister ? 'Registrer Bruger' : 'Log Ind')}
      </button>
      {onToggleMode && (
        <button
          type="button"
          onClick={onToggleMode}
          className="mt-2 w-full text-sm text-sky-600 hover:text-sky-500"
        >
          {isRegister ? 'Har du allerede en konto? Log ind' : 'Har du ikke en konto? Registrer dig'}
        </button>
      )}
    </form>
  );
};

export default AuthForm;

