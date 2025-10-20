import api from "./api";

export async function login(values) {
  try {
    const response = await api.post("/login", {
      email: values.email,
      password: values.password,
    });

    const { token, user } = response.data;
    if (typeof window !== "undefined") {
      // Salva o token no cookie
      document.cookie = `token=${token}; path=/; secure; samesite=strict`;
      
      // Salva os dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(user));
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
    // Remove o token e dados do usuário do front-end
    if (typeof window !== "undefined") {
      document.cookie = "token=; Max-Age=0; path=/;";
      localStorage.removeItem('user');
      window.location.href = "/login"; // redireciona para login
    }
  }
}

// Função para obter dados do usuário do localStorage
export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
}
