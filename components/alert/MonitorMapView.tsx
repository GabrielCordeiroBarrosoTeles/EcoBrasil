'use client'

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo } from "react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

type MonitorMapViewProps = {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  badgeLabel?: string;
  className?: string;
  mapClassName?: string;
};

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -38],
  shadowAnchor: [13, 41],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export function MonitorMapView({
  latitude,
  longitude,
  title,
  description,
  badgeLabel,
  className,
  mapClassName,
}: MonitorMapViewProps) {
  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude]);

  return (
    <Card className={cn("border border-slate-200 shadow-lg h-full", className)}>
      <CardContent className="p-0 h-full">
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom
          className={cn("h-full w-full rounded-2xl", mapClassName)}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {title ?? "Alerta"}
                </p>
                {description && (
                  <p className="text-xs leading-relaxed text-slate-600">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Lat: {latitude.toFixed(4)}</span>
                <span>Lng: {longitude.toFixed(4)}</span>
              </div>
              {badgeLabel && <Badge variant="outline">{badgeLabel}</Badge>}
            </Popup>
          </Marker>
        </MapContainer>
      </CardContent>
    </Card>
  );
}

