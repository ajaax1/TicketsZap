"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    notifications = [],
    unreadCount = 0,
    loading = true,
    markAsRead = () => {},
    markAllAsRead = () => {},
    deleteNotification = () => {},
  } = useNotifications();

  // Garantir que só renderiza após montagem no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: log quando o componente renderiza (apenas no cliente)
  useEffect(() => {
    if (mounted) {
      console.log("🔔 NotificationBell:", {
        notifications: notifications.length,
        unreadCount,
        loading,
      });
    }
  }, [mounted, notifications.length, unreadCount, loading]);

  const handleNotificationClick = (notification) => {
    // Marcar como lida se ainda não estiver lida
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Navegar para o ticket
    const ticketId = notification.data?.ticket_id;
    if (ticketId) {
      router.push(`/tickets/${ticketId}`);
      setOpen(false);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative cursor-pointer"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          {mounted && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notificações</h3>
              {!loading && (
                <span className="text-xs text-muted-foreground">
                  ({notifications.length})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => {
                  const isUnread = !notification.read_at;
                  const notificationData = notification.data || {};
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-accent transition-colors relative group rounded-md",
                        isUnread && "bg-accent/50"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Mensagem de atribuição */}
                          <p
                            className={cn(
                              "text-sm mb-1",
                              isUnread ? "font-medium" : "text-muted-foreground"
                            )}
                          >
                            {notificationData.message || 
                             `Um chamado foi atribuído a você`}
                          </p>
                          {/* Título do chamado */}
                          {notificationData.ticket_title && (
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                isUnread ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {notificationData.ticket_title.length > 50
                                ? `${notificationData.ticket_title.substring(0, 50)}...`
                                : notificationData.ticket_title}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {notificationData.ticket_priority && (
                              <Badge
                                variant={
                                  notificationData.ticket_priority === "alta"
                                    ? "destructive"
                                    : notificationData.ticket_priority ===
                                      "média"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {notificationData.ticket_priority}
                              </Badge>
                            )}
                            {notificationData.ticket_status && (
                              <span className="text-xs text-muted-foreground">
                                {notificationData.ticket_status}
                              </span>
                            )}
                          </div>
                          {notification.created_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(
                                new Date(notification.created_at),
                                {
                                  addSuffix: true,
                                  locale: ptBR,
                                }
                              )}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive rounded"
                          onClick={(e) => handleDelete(e, notification.id)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

