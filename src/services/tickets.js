import api from "./api";

export async function getTickets() {
  const response = await api.get("/tickets"); 
  return response.data;
}

export async function getTicketById(id) {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
}
