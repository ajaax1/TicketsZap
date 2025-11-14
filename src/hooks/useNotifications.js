"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUnreadNotifications,
  getUnreadCount,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  deleteNotification as deleteNotificationService,
} from "@/services/notifications";

/**
 * Hook para gerenciar notificações do usuário
 * @returns {Object} Objeto com notificações, contagem, funções e estado de loading
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Buscar notificações não lidas
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await getUnreadNotifications(1);
      console.log("📬 Notificações recebidas:", response);
      
      // O serviço já retorna response.data, então:
      // Se a API Laravel retorna { current_page: 1, data: [...], ... }
      // O serviço retorna exatamente isso, então precisamos pegar response.data
      let notificationsData = [];
      
      if (Array.isArray(response)) {
        // Se já é um array direto
        notificationsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Se é um objeto paginado com propriedade data
        notificationsData = response.data;
      } else if (response && typeof response === 'object') {
        // Se é um objeto mas não tem data, pode ser que seja o array direto em outra estrutura
        console.warn("Estrutura de resposta inesperada:", response);
        notificationsData = [];
      }
      
      // Garantir que notificationsData é um array
      if (!Array.isArray(notificationsData)) {
        console.warn("notificationsData não é um array:", notificationsData);
        notificationsData = [];
      }
      
      // Se o campo data da notificação for string JSON, fazer parse
      notificationsData = notificationsData.map((notif) => {
        // Criar uma cópia para não mutar o original
        const notification = { ...notif };
        
        if (typeof notification.data === 'string') {
          try {
            notification.data = JSON.parse(notification.data);
          } catch (e) {
            console.warn("Erro ao fazer parse do data da notificação:", e);
            notification.data = {};
          }
        }
        
        // Garantir que data existe
        if (!notification.data || typeof notification.data !== 'object') {
          notification.data = {};
        }
        
        return notification;
      });
      
      console.log("✅ Notificações processadas:", notificationsData.length, "itens");
      setNotifications(notificationsData);
    } catch (error) {
      console.error("❌ Erro ao buscar notificações:", error);
      console.error("Status:", error.response?.status);
      console.error("Detalhes:", error.response?.data || error.message);
      // Em caso de erro, definir array vazio para não quebrar a UI
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar contagem de não lidas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      // Garantir que count é um número
      const countNumber = typeof count === 'number' ? count : parseInt(count) || 0;
      setUnreadCount(countNumber);
    } catch (error) {
      console.error("❌ Erro ao buscar contagem:", error);
      console.error("Status:", error.response?.status);
      console.error("Detalhes:", error.response?.data || error.message);
      // Em caso de erro, definir 0 para não quebrar a UI
      setUnreadCount(0);
    }
  }, []);

  // Marcar como lida
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await markAsReadService(notificationId);

        // Atualizar estado local
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );

        // Atualizar contagem
        await fetchUnreadCount();
      } catch (error) {
        console.error("Erro ao marcar como lida:", error);
      }
    },
    [fetchUnreadCount]
  );

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadService();

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  }, []);

  // Deletar notificação
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await deleteNotificationService(notificationId);

        // Remover do estado local
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );

        // Atualizar contagem
        await fetchUnreadCount();
      } catch (error) {
        console.error("Erro ao deletar notificação:", error);
      }
    },
    [fetchUnreadCount]
  );

  // Atualizar notificações e contagem
  const refresh = useCallback(async () => {
    await Promise.all([fetchUnreadNotifications(), fetchUnreadCount()]);
  }, [fetchUnreadNotifications, fetchUnreadCount]);

  useEffect(() => {
    // Garantir que estamos no cliente
    if (typeof window === "undefined") {
      return;
    }
    
    // Verificar se há token antes de buscar
    const hasToken = document.cookie.includes("token=");
    
    if (!hasToken) {
      setLoading(false);
      return;
    }
    
    // Buscar inicialmente
    refresh().catch((error) => {
      console.error("Erro ao buscar notificações:", error);
      setLoading(false);
    });

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      refresh().catch((error) => {
        console.error("Erro ao atualizar notificações:", error);
      });
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}


