"use client";

import { Trash2 } from "lucide-react";
import { clearTestData } from "@/app/actions";
import { useState } from "react";

export function ResetButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReset = async () => {
    if (confirm("Tem certeza que deseja deletar todos os registros de teste? Esta ação não pode ser desfeita.")) {
      setIsDeleting(true);
      try {
        await clearTestData();
      } catch (error) {
        console.error("Erro ao deletar dados:", error);
        alert("Ocorreu um erro ao deletar os dados.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isDeleting}
      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
      title="Limpar todos os registros de teste"
    >
      <Trash2 size={20} />
      {isDeleting ? "Limpando..." : "Resetar Testes"}
    </button>
  );
}
