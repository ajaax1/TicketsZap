import api from "./api";

export async function login(values) {
  try {
    const response = await api.post("/login", {
      email: values.email,
      password: values.password,
    });

    const token = response.data.token;
    if (typeof window !== "undefined") {
      document.cookie = `token=${token}; path=/; secure; samesite=strict`;
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao logar");
  }
}


function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

export async function logout() {
  try {
    // Chama a rota de logout do Laravel
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erro ao fazer logout no servidor:", error);
  } finally {
    // Remove o token do front-end
    if (typeof window !== "undefined") {
      document.cookie = "token=; Max-Age=0; path=/;";
      window.location.href = "/login"; // redireciona para login
    }
  }
}
