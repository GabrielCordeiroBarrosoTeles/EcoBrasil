
import React from "react";
import { Card, CardContent } from '../ui/card';
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area"; 
import { Flame, Cloud, ThermometerSun, Droplet, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const alertIcons: { [key: string]: React.ReactNode } = {
  incendio: <Flame className="w-4 h-4" />,
  fumaca_intensa: <Cloud className="w-4 h-4" />,
  temperatura_extrema: <ThermometerSun className="w-4 h-4" />,
  seca: <Droplet className="w-4 h-4" />,
  preditivo: <AlertTriangle className="w-4 h-4" />,
};

const criticalityColors = {
  baixo: "bg-blue-100 text-blue-800 border-blue-200",
  medio: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alto: "bg-orange-100 text-orange-800 border-orange-200",
  critico: "bg-red-100 text-red-800 border-red-200",
};

const criticalityLabels = { baixo: "Baixo", medio: "Médio", alto: "Alto", critico: "Crítico" };

interface Alert {
    id: string | number;
    titulo: string;
    tipo: keyof typeof alertIcons;
    nivel_criticidade: keyof typeof criticalityColors;
    created_date: string;
}

interface ActiveAlertsProps {
    alerts: Alert[];
    loading: boolean;
}

export default function ActiveAlerts({ alerts, loading }: ActiveAlertsProps) {
    if (loading) {
        return <Card className="shadow-xl border-0 p-4">Carregando alertas...</Card>
    }

    return (
        <Card className="shadow-xl border-0">
            <h2 className="text-xl font-bold p-4">Alertas Ativos</h2>
            <ScrollArea className="h-[500px] p-4 pt-0">
                <div className="space-y-4">
                    {(alerts || []).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-4">
                            <span className={`mt-1 p-2 rounded-full ${criticalityColors[alert.nivel_criticidade]}`}>
                                {alertIcons[alert.tipo]}
                            </span>
                            <div>
                                <p className="font-semibold">{alert.titulo}</p>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Badge className={criticalityColors[alert.nivel_criticidade]}>
                                        {criticalityLabels[alert.nivel_criticidade]}
                                    </Badge>
                                    <span>•</span>
                                    <p>{format(new Date(alert.created_date), "dd MMM, HH:mm", { locale: ptBR })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    );
}