import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Badge } from "../ui/badge";
import { Thermometer, Wind, Droplets, AlertTriangle } from "lucide-react";

// Importa os estilos do Leaflet
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DefaultIcon = L.icon({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// --- DEFINIÇÃO DOS TIPOS ---
interface MonitoringPoint {
  id: number | string;
  latitude: number;
  longitude: number;
  nome: string;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
  temperatura: number;
  nivel_fumaca: number;
  umidade: number;
  velocidade_vento: number;
  regiao: string;
  estado: string;
}

interface Alert {
  id: number | string;
  latitude?: number;
  longitude?: number;
}

interface MapViewProps {
  points: MonitoringPoint[];
  alerts: Alert[];
  loading: boolean;
}

// --- CONSTANTES DE ESTILIZAÇÃO ---
const riskColors = { baixo: "#10b981", medio: "#f59e0b", alto: "#ef4444", critico: "#991b1b" };
const riskLabels = { baixo: "Baixo", medio: "Médio", alto: "Alto", critico: "Crítico" };
const riskVariants = { baixo: "bg-emerald-500 hover:bg-emerald-600", medio: "bg-amber-500 hover:bg-amber-600", alto: "bg-red-500 hover:bg-red-600", critico: "bg-red-800 hover:bg-red-900" };

// --- COMPONENTE COMPLETO E CORRIGIDO ---
export default function MapView({ points, alerts, loading }: MapViewProps) {
  const center: [number, number] = [-14.235, -51.9253];

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-slate-100 rounded-lg">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Carregando mapa e pontos de monitoramento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] relative rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />

        {(points || []).map((point) => (
          <React.Fragment key={`point-${point.id}`}>
            <Circle
              center={[point.latitude, point.longitude] as [number, number]}
              radius={50000}
              pathOptions={{ color: riskColors[point.nivel_risco], fillColor: riskColors[point.nivel_risco], fillOpacity: 0.2 }}
            />
            <Marker 
              position={[point.latitude, point.longitude] as [number, number]}
              icon={DefaultIcon} // O ícone é passado como prop para o Marker
            >
              <Popup>
                <div className="p-1 min-w-[250px]">
                  <h3 className="font-bold text-lg mb-2">{point.nome}</h3>
                  <Badge className={`mb-3 text-white ${riskVariants[point.nivel_risco]}`}>{riskLabels[point.nivel_risco]}</Badge>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm"><Thermometer className="w-4 h-4 text-red-500" /> <span className="font-medium">Temperatura:</span> <span>{point.temperatura}°C</span></div>
                    <div className="flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-orange-500" /> <span className="font-medium">Fumaça:</span> <span>{point.nivel_fumaca}%</span></div>
                    <div className="flex items-center gap-2 text-sm"><Droplets className="w-4 h-4 text-blue-500" /> <span className="font-medium">Umidade:</span> <span>{point.umidade}%</span></div>
                    <div className="flex items-center gap-2 text-sm"><Wind className="w-4 h-4 text-slate-500" /> <span className="font-medium">Vento:</span> <span>{point.velocidade_vento} km/h</span></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">{point.regiao} - {point.estado}</p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {(alerts || []).map((alert) => 
          alert.latitude && alert.longitude && (
            <Circle
              key={`alert-${alert.id}`}
              center={[alert.latitude, alert.longitude] as [number, number]}
              radius={30000}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, dashArray: '5, 5' }}
            />
          )
        )}
      </MapContainer>
    </div>
  );
}