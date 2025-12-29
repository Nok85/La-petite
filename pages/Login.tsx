import React, { useState } from 'react';
import { login, forgotPassword } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [forgotUser, setForgotUser] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(username, password);
    if (res.success && res.user) {
      onLogin(res.user);
    } else {
      setError(res.message || 'Erro ao logar');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword(forgotUser);
    setForgotMsg('Solicitação enviada ao administrador. Aguarde o contato.');
    setTimeout(() => {
        setIsForgot(false);
        setForgotMsg('');
        setForgotUser('');
    }, 3000);
  };

  if (isForgot) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-primary">Recuperar Senha</h2>
          {forgotMsg ? (
              <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">{forgotMsg}</div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
                <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">Usuário</label>
                <input
                    type="text"
                    value={forgotUser}
                    onChange={(e) => setForgotUser(e.target.value)}
                    className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                />
                </div>
                <button
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-accent rounded hover:bg-sky-600 focus:outline-none"
                >
                Confirmar
                </button>
                <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full mt-2 text-sm text-center text-gray-500 hover:text-gray-800"
                >
                Voltar para Login
                </button>
            </form>
          )}
        </div>
      </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Cockpit <span className="text-accent">Cotações La Petite</span></h1>
            <p className="text-gray-500 mt-2">Gestão de Orçamentos</p>
        </div>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 font-bold text-white bg-primary rounded-lg hover:bg-slate-800 focus:outline-none transition-colors"
          >
            Entrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsForgot(true)}
            className="text-sm text-accent hover:text-sky-700"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
};