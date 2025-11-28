import api from "./api";

/**
 * Serviço para gerenciar logs de atividades
 */

/**
 * Lista todos os logs de atividades (paginado)
 * @param {Object} params - Parâmetros de filtro
 * @param {number} params.user_id - Filtrar por ID do usuário
 * @param {string} params.action - Filtrar por ação (created, updated, deleted, viewed, assigned, status_changed)
 * @param {string} params.model_type - Filtrar por tipo de model
 * @param {number} params.model_id - Filtrar por ID do model
 * @param {string} params.period - Filtrar por período: 'day', 'week', 'month', 'year', 'all'
 * @param {string} params.from - Data inicial (YYYY-MM-DD)
 * @param {string} params.to - Data final (YYYY-MM-DD)
 * @param {number} params.per_page - Itens por página (padrão: 50, máximo: 100)
 * @param {number} params.page - Página atual
 * @returns {Promise<Object>} Dados paginados dos logs
 */
export async function getActivityLogs(params = {}) {
  const response = await api.get(`/activity-logs`, {
    params: {
      per_page: params.per_page || 50,
      page: params.page || 1,
      ...params
    }
  });
  return response.data;
}

/**
 * Busca um log específico por ID
 * @param {number} id - ID do log
 * @returns {Promise<Object>} Dados do log
 */
export async function getActivityLog(id) {
  const response = await api.get(`/activity-logs/${id}`);
  return response.data;
}

/**
 * Busca logs de um usuário específico
 * @param {number} userId - ID do usuário
 * @param {Object} params - Parâmetros opcionais
 * @param {string} params.period - Período: 'day', 'week', 'month', 'year', 'all'
 * @param {number} params.per_page - Itens por página
 * @param {number} params.page - Página atual
 * @returns {Promise<Object>} Dados paginados dos logs do usuário
 */
export async function getUserActivityLogs(userId, params = {}) {
  const response = await api.get(`/activity-logs/user/${userId}`, {
    params: {
      per_page: params.per_page || 50,
      page: params.page || 1,
      ...params
    }
  });
  return response.data;
}

/**
 * Busca logs de um ticket específico
 * @param {number} ticketId - ID do ticket
 * @param {Object} params - Parâmetros opcionais
 * @param {number} params.per_page - Itens por página
 * @param {number} params.page - Página atual
 * @returns {Promise<Object>} Dados paginados dos logs do ticket
 */
export async function getTicketActivityLogs(ticketId, params = {}) {
  const response = await api.get(`/activity-logs/ticket/${ticketId}`, {
    params: {
      per_page: params.per_page || 50,
      page: params.page || 1,
      ...params
    }
  });
  return response.data;
}

/**
 * Busca estatísticas dos logs
 * @param {Object} params - Parâmetros opcionais
 * @param {string} params.period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas agregadas dos logs
 */
export async function getActivityLogsStats(params = {}) {
  const response = await api.get(`/activity-logs/stats`, {
    params
  });
  return response.data;
}

