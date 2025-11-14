import api from "./api";

/**
 * Busca todas as notificações do usuário autenticado
 * @param {number} page - Número da página (padrão: 1)
 * @returns {Promise<Object>} Resposta com notificações paginadas
 */
export async function getNotifications(page = 1) {
  const response = await api.get(`/notifications`, { params: { page } });
  return response.data;
}

/**
 * Busca apenas as notificações não lidas
 * @param {number} page - Número da página (padrão: 1)
 * @returns {Promise<Object>} Resposta com notificações não lidas paginadas
 */
export async function getUnreadNotifications(page = 1) {
  const response = await api.get(`/notifications/unread`, { params: { page } });
  return response.data;
}

/**
 * Busca o número de notificações não lidas
 * @returns {Promise<number>} Número de notificações não lidas
 */
export async function getUnreadCount() {
  const response = await api.get(`/notifications/count`);
  return response.data.count;
}

/**
 * Marca uma notificação específica como lida
 * @param {string} notificationId - UUID da notificação
 * @returns {Promise<Object>} Resposta da API
 */
export async function markAsRead(notificationId) {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
}

/**
 * Marca todas as notificações não lidas como lidas
 * @returns {Promise<Object>} Resposta da API
 */
export async function markAllAsRead() {
  const response = await api.post(`/notifications/read-all`);
  return response.data;
}

/**
 * Deleta uma notificação
 * @param {string} notificationId - UUID da notificação
 * @returns {Promise<Object>} Resposta da API
 */
export async function deleteNotification(notificationId) {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
}

