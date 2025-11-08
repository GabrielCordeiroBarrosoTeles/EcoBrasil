import React from "react";
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter } from "lucide-react";

const biomas = [
    { value: "todas", label: "Todas as Regiões" },
    { value: "amazonia", label: "Amazônia" },
    { value: "cerrado", label: "Cerrado" },
    { value: "mata_atlantica", label: "Mata Atlântica" },
    { value: "caatinga", label: "Caatinga" },
    { value: "pantanal", label: "Pantanal" },
    { value: "pampa", label: "Pampa" },
];

const niveis = [
    { value: "todos", label: "Todos os Níveis" },
    { value: "baixo", label: "Baixo" },
    { value: "medio", label: "Médio" },
    { value: "alto", label: "Alto" },
    { value: "critico", label: "Crítico" },
];

// Define o formato das props do componente
interface FilterPanelProps {
  filters: {
    regiao: string;
    nivel_risco: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{ regiao: string; nivel_risco: string; }>>;
}

export default function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  // Nota: a funcionalidade do Select é um placeholder.
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <span className="font-semibold text-slate-700">Filtros:</span>
          </div>
          {/* Adicione os componentes Select aqui quando a funcionalidade for implementada */}
          <p className="text-sm text-slate-500">Funcionalidade de filtro a ser implementada.</p>
        </div>
      </CardContent>
    </Card>
  )
}