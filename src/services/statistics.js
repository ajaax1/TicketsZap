import api from "./api";

/**
 * Busca estatísticas do dashboard geral
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Dados do dashboard
 */
export async function getDashboardStats(period = 'month') {
  const response = await api.get(`/admin/statistics/dashboard`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca estatísticas de tickets
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas de tickets
 */
export async function getTicketsStats(period = 'month') {
  const response = await api.get(`/admin/statistics/tickets`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca estatísticas de usuários
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas de usuários
 */
export async function getUsersStats(period = 'month') {
  const response = await api.get(`/admin/statistics/users`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca estatísticas de mensagens
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas de mensagens
 */
export async function getMessagesStats(period = 'month') {
  const response = await api.get(`/admin/statistics/messages`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca estatísticas de anexos
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas de anexos
 */
export async function getAttachmentsStats(period = 'month') {
  const response = await api.get(`/admin/statistics/attachments`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca estatísticas pessoais do usuário logado
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas pessoais
 */
export async function getMyStats(period = 'month') {
  const response = await api.get(`/statistics/my-stats`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca estatísticas pessoais do admin
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Estatísticas pessoais do admin
 */
export async function getAdminMyStats(period = 'month') {
  const response = await api.get(`/admin/statistics/my-stats`, {
    params: { period }
  });
  return response.data;
}

/**
 * Compara performance do admin com média dos outros usuários
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @returns {Promise<Object>} Dados de comparação de performance
 */
export async function comparePerformance(period = 'month') {
  const response = await api.get(`/admin/statistics/compare-performance`, {
    params: { period }
  });
  return response.data;
}

/**
 * Busca histórico de atividades do usuário logado
 * @param {string} period - Período: 'day', 'week', 'month', 'year', 'all'
 * @param {number} limit - Número máximo de atividades na timeline (padrão: 50)
 * @returns {Promise<Object>} Histórico de atividades
 */
export async function getMyActivity(period = 'month', limit = 50) {
  const response = await api.get(`/statistics/my-activity`, {
    params: { period, limit }
  });
  return response.data;
}

