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