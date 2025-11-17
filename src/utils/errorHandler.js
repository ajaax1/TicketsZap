/**
 * Função auxiliar para tratar erros da API de forma consistente
 * @param {Error} error - Objeto de erro do axios
 * @param {string} defaultMessage - Mensagem padrão caso não haja mensagem específica
 * @returns {string} Mensagem de erro formatada para exibir ao usuário
 */
export function getErrorMessage(error, defaultMessage = "Ocorreu um erro. Por favor, tente novamente.") {
  // Se o erro já tem uma mensagem amigável do interceptor
  if (error.userMessage) {
    return error.userMessage;
  }

  // Tenta obter mensagem da resposta da API
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) {
    return apiMessage;
  }

  // Tenta obter mensagem de erros de validação
  const apiErrors = error?.response?.data?.errors;
  if (apiErrors && typeof apiErrors === "object") {
    // Pega o primeiro erro encontrado
    const firstErrorKey = Object.keys(apiErrors)[0];
    const firstError = apiErrors[firstErrorKey];
    
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    } else if (typeof firstError === "string") {
      return firstError;
    }
  }

  // Mensagem padrão baseada no status HTTP
  const status = error?.response?.status;
  if (status === 500) {
    return "Erro interno do servidor. Por favor, tente novamente mais tarde ou entre em contato com o suporte.";
  } else if (status === 401) {
    return "Sua sessão expirou. Por favor, faça login novamente.";
  } else if (status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  } else if (status === 404) {
    return "Recurso não encontrado.";
  } else if (status === 422) {
    return "Dados inválidos. Verifique os campos do formulário.";
  } else if (!status) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  // Retorna mensagem padrão
  return defaultMessage;
}

/**
 * Loga erros de forma estruturada para debug
 * @param {Error} error - Objeto de erro
 * @param {string} context - Contexto onde o erro ocorreu (ex: "ao criar chamado")
 */
export function logError(error, context = "") {
  if (process.env.NODE_ENV === "development") {
    console.group(`❌ Erro ${context ? `- ${context}` : ""}`);
    console.error("Erro:", error);
    console.error("Status:", error?.response?.status);
    console.error("URL:", error?.config?.url);
    console.error("Método:", error?.config?.method?.toUpperCase());
    if (error?.response?.data) {
      console.error("Resposta:", error.response.data);
    }
    console.groupEnd();
  }
}

