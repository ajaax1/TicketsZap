"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se existe token no cookie
    const hasToken = document.cookie.includes("token=");
    
    // Verifica se existe usuário no localStorage
    const hasUser = localStorage.getItem('user');
    
    if (!hasToken || !hasUser) {
      router.push("/login");
    }
  }, [router]);
}

export async function logout() {
  try {
    await api.post("/logout"); // invalida o token no backend
  } catch (error) {
    console.warn("Erro ao deslogar do backend:", error);
  } finally {
    // sempre limpa o token local
    if (typeof window !== "undefined") {
      document.cookie = "token=; Max-Age=0; path=/;";
      window.location.href = "/login";
    }
  }
}