import api from "./api";

/**
 * Upload de múltiplos arquivos para um ticket
 * @param {number} ticketId - ID do ticket
 * @param {File[]} files - Array de arquivos para upload
 * @returns {Promise} Resposta da API com os anexos criados
 */
export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("arquivos[]", file);
  });

  const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Lista todos os anexos de um ticket
 * @param {number} ticketId - ID do ticket
 * @returns {Promise} Array de anexos
 */
export async function getTicketAttachments(ticketId) {
  const response = await api.get(`/tickets/${ticketId}/attachments`);
  return response.data;
}

/**
 * Visualiza um arquivo (para imagens e PDFs)
 * @param {number} attachmentId - ID do anexo
 * @returns {string} URL do arquivo
 */
export function getAttachmentUrl(attachmentId) {
  // A URL já vem no objeto attachment, mas podemos construir aqui se necessário
  return `/api/attachments/${attachmentId}`;
}

/**
 * Faz download de um arquivo
 * @param {number} attachmentId - ID do anexo
 * @returns {Promise} Blob do arquivo
 */
export async function downloadAttachment(attachmentId) {
  const response = await api.get(`/attachments/${attachmentId}/download`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Deleta um anexo
 * @param {number} attachmentId - ID do anexo
 * @returns {Promise} Resposta da API
 */
export async function deleteAttachment(attachmentId) {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response.data;
}

