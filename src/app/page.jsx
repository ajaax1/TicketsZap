"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { getTickets } from "@/services/tickets";
import { Spinner } from "@/components/ui/spinner"; // Importa o Spinner do ShadCN

const currentUser = {
  name: "Carlos Silva",
  email: "carlos@empresa.com",
  avatar: "/avatars/1.jpg",
};

export default function DashboardPage() {
  useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await getTickets();
        const data = Array.isArray(response.data) ? response.data : response;
        setTickets(data);
      } catch (err) {
        console.error("Erro ao buscar tickets:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Sistema de Chamados" user={currentUser} />

      <main className="flex-1 min-w-svw container py-8 flex justify-center">
        <div className="max-w-6xl container flex px-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6 min-w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Todos os Chamados</h2>
              <Button asChild>
                <Link href="/dashboard/tickets/new">Novo Chamado</Link>
              </Button>
            </div>

            <TicketFilters />

            <div className="border rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Spinner className="w-10 h-10 text-blue-600" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-center">Nenhum chamado encontrado.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/tickets/${ticket.id}`}
                            className="hover:underline font-medium"
                          >
                            {ticket.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              ticket.status === "open"
                                ? "bg-blue-100 text-blue-800"
                                : ticket.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {ticket.status === "open"
                              ? "Aberto"
                              : ticket.status === "in_progress"
                              ? "Em andamento"
                              : "Fechado"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {ticket.created_at
                            ? format(new Date(ticket.created_at), "PP", { locale: ptBR })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
