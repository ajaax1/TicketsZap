"use client";

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

// Mock data - substitua pela sua API real
type Ticket = {
  id: string;
  title: string;
  createdAt: Date;
  status: "open" | "closed" | "in_progress";
};

const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Problema com login",
    createdAt: new Date(2023, 5, 15),
    status: "open",
  },
  {
    id: "2",
    title: "Erro na página de cadastro",
    createdAt: new Date(2023, 5, 10),
    status: "in_progress",
  },
  {
    id: "3",
    title: "Consulta de saldo não funciona",
    createdAt: new Date(2023, 4, 28),
    status: "closed",
  },
  {
    id: "4",
    title: "Layout quebrado no mobile",
    createdAt: new Date(2023, 6, 2),
    status: "open",
  },
  {
    id: "5",
    title: "Integração com API de pagamentos",
    createdAt: new Date(2023, 5, 20),
    status: "in_progress",
  },
];

// Mock user - substitua pelo contexto real de autenticação
const currentUser = {
  name: "Carlos Silva",
  email: "carlos@empresa.com",
  avatar: "/avatars/1.jpg",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Sistema de Chamados"
        user={currentUser}
      />

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-svw
 container py-8 flex justify-center">
        <div className="max-w-6xl container flex px-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6 min-w-full">
            <div className="flex justify-between items-center mb-6 ">
              <h2 className="text-lg font-semibold">Todos os Chamados</h2>
              <Button asChild>
                <Link href="/dashboard/tickets/new">
                  Novo Chamado
                </Link>
              </Button>
            </div>
            
            <TicketFilters />
            
            <div className="border rounded-lg overflow-hidden">
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
                  {mockTickets.map((ticket) => (
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
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : ticket.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {ticket.status === "open" 
                            ? "Aberto" 
                            : ticket.status === "in_progress" 
                            ? "Em andamento" 
                            : "Fechado"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {format(ticket.createdAt, "PP", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}