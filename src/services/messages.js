import api from "./api";

/**
 * Lista todas as mensagens internas de um chamado específico
 * @param {number|string} ticketId - ID do chamado
 * @returns {Promise<Array>} Array de mensagens
 */
export async function getTicketMessages(ticketId) {
  const response = await api.get(`/tickets/${ticketId}/messages-internal`);
  return response.data;
}

/**
 * Envia uma nova mensagem interna no chamado
 * @param {number|string} ticketId - ID do chamado
 * @param {string} message - Conteúdo da mensagem
 * @param {boolean} isInternal - Se true, mensagem visível apenas para admin/support
 * @param {File[]} files - Array opcional de arquivos para anexar (máximo 10 arquivos, 10MB cada)
 * @returns {Promise<Object>} Resposta com mensagem criada e anexos
 */
export async function sendTicketMessage(ticketId, message, isInternal = false, files = []) {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("is_internal", isInternal ? "1" : "0");
  
  // Adicionar arquivos ao FormData
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("anexos[]", file);
    });
  }

  const response = await api.post(`/tickets/${ticketId}/messages-internal`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Visualiza um anexo de mensagem no navegador
 * @param {number|string} attachmentId - ID do anexo
 * @returns {string} URL do arquivo
 */
export function getMessageAttachmentUrl(attachmentId) {
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/message-attachments/${attachmentId}`;
}

/**
 * Faz download de um anexo de mensagem
 * @param {number|string} attachmentId - ID do anexo
 * @returns {Promise<Blob>} Blob do arquivo
 */
export async function downloadMessageAttachment(attachmentId) {
  const response = await api.get(`/message-attachments/${attachmentId}/download`, {
    responseType: "blob",
  });
  return response.data;
}

