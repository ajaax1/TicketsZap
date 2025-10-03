import axios from "axios";

export async function login(email, password) {
  try {
    const response = await axios.post("http://localhost:8000/api/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao logar");
  }
}
