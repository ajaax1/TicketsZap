import api from "./api";

export async function getUsersAlphabetical() {
  try {
    const response = await api.get("/users-alphabetical"); 
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuários em ordem alfabética:", error);
    throw error;
  }
}

export async function getUsers(page = 1, filters = {}) {
  const params = { page }
  if (filters.search && filters.search.trim()) params.search = filters.search.trim()
  if (filters.role && filters.role !== "todos") params.role = filters.role
  
  const response = await api.get(`/users`, { params });
  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function getUserStats() {
  const response = await api.get(`/users-stats`)
  return response.data
}

export async function createUser(payload) {
  const response = await api.post(`/users`, payload)
  return response.data
}

export async function updateUser(id, payload) {
  const response = await api.put(`/users/${id}`, payload)
  return response.data
}

export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`)
  return response.data
}