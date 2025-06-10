import React from "react";
import { Button } from "@/components/ui/button";

export default function CustomDivTest() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-50 p-8">
      {/* Div principal com efeitos visuais */}
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600">✨ Teste Tailwind + shadcn ✨</h1>
          <p className="mt-2 text-gray-500">Esta é uma div customizada para testar estilos!</p>
        </div>

        {/* Corpo com animação */}
        <div className="animate-pulse bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <p className="text-indigo-800 font-medium">
            Se os estilos funcionarem, você verá:
          </p>
          <ul className="mt-2 list-disc list-inside text-indigo-700 space-y-1">
            <li>Gradiente de fundo</li>
            <li>Sombras e bordas arredondadas</li>
            <li>Cores customizadas (indigo/purple)</li>
            <li>Animação sutil no card interno</li>
          </ul>
        </div>

        <Button >
  Botão Customizado
</Button>
        
      </div>
    </div>
  );
}