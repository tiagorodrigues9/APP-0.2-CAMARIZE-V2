import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioCamarize');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  // Removida limpeza automática do token para não interferir no fluxo normal

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setError('Você precisa estar logado para acessar esta página');
        return;
      }

      // Verificar se o token é válido fazendo uma requisição
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await axios.get(`${apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsAuthenticated(true);
      setUser(response.data);
    } catch (err) {
      console.error('Erro de autenticação:', err);
      
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente para continuar.');
        clearAuthData();
      } else {
        setError('Erro ao verificar autenticação. Tente novamente.');
      }
      
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    clearAuthData();
  };

  return {
    isAuthenticated,
    loading,
    error,
    user,
    checkAuth,
    logout,
    clearAuthData
  };
} 