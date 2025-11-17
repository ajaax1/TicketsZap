import axios from "axios";

function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  
  // Tenta múltiplas formas de ler o cookie para garantir compatibilidade
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token' && value) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Interceptor de requisição: adiciona token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta: trata erros HTTP
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const config = error.config;
    
    // Log detalhado do erro para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Erro na Requisição API');
      console.error('Status:', status);
      console.error('URL:', config?.url);
      console.error('Método:', config?.method?.toUpperCase());
      console.error('Erro completo:', error);
      if (error.response?.data) {
        console.error('Resposta do servidor:', error.response.data);
      }
      console.groupEnd();
    }
    
    // Tratamento específico por status HTTP
    if (status === 401) {
      // Erro 401: Não autenticado
      if (typeof window !== "undefined") {
        document.cookie = "token=; Max-Age=0; path=/;";
        localStorage.removeItem('user');
        
        // Redireciona para login apenas se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (status === 500) {
      // Erro 500: Erro interno do servidor
      // Adiciona mensagem mais amigável ao erro
      const serverMessage = error.response?.data?.message;
      const errorMessage = serverMessage 
        ? `Erro no servidor: ${serverMessage}` 
        : 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
      
      // Adiciona a mensagem ao objeto de erro para uso nos catch blocks
      error.userMessage = errorMessage;
      
      // Log adicional para erros 500
      if (typeof window !== "undefined") {
        console.error('Erro 500 - Detalhes:', {
          url: config?.url,
          method: config?.method,
          data: error.response?.data,
          timestamp: new Date().toISOString()
        });
      }
    } else if (status === 403) {
      // Erro 403: Acesso negado
      error.userMessage = error.response?.data?.message || 'Você não tem permissão para realizar esta ação.';
    } else if (status === 404) {
      // Erro 404: Não encontrado
      error.userMessage = error.response?.data?.message || 'Recurso não encontrado.';
    } else if (status === 422) {
      // Erro 422: Validação
      error.userMessage = error.response?.data?.message || 'Dados inválidos. Verifique os campos do formulário.';
    } else if (!status) {
      // Erro de rede (sem resposta do servidor)
      error.userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
