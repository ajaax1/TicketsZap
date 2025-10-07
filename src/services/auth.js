import api from "./api";

export async function login(values) {
  try {
    const response = await api.post("/login", {
      email: values.email,
      password: values.password,
    });

    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao logar");
  }
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login"; 
}
