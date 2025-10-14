import api from "./api";

export async function getTickets(page = 1, filters = {}) {
  const params = { page }
  if (filters.status && filters.status !== "todos") params.status = filters.status
  if (filters.owner && filters.owner !== "todos") params.owner = filters.owner
  if (filters.priority && filters.priority !== "todos") params.priority = filters.priority
  if (filters.q && filters.q.trim()) params.q = filters.q.trim()
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to

  const response = await api.get(`/tickets`, { params });
  return response.data;
}

export async function getTicketById(id) {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
}
