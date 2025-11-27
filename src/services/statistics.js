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
 * Busca dados de tendências
 * @param {number} days - Número de dias para análise (padrão: 30)
 * @returns {Promise<Object>} Dados de tendências
 */
export async function getTrendsStats(days = 30) {
  const response = await api.get(`/admin/statistics/trends`, {
    params: { days }
  });
  return response.data;
}

