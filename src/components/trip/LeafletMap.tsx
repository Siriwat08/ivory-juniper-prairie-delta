import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place, PlanStop } from "@/lib/engine/types";

type Props = {
  origin: Place;
  destination: Place;
  waypoints: Place[];
  stops: PlanStop[];
};

function makeIcon(label: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div class="desk-marker" style="background:${color}">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function Fit({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const b = L.latLngBounds(points);
    map.fitBounds(b, { padding: [32, 32], maxZoom: 9 });
  }, [map, points]);
  return null;
}

export function LeafletMap({ origin, destination, waypoints, stops }: Props) {
  const nodes = useMemo<[number, number][]>(
    () => [
      [origin.lat, origin.lng],
      ...waypoints.map((w) => [w.lat, w.lng] as [number, number]),
      [destination.lat, destination.lng],
    ],
    [origin, destination, waypoints],
  );
  const restStops = stops.filter((s) => s.type === "rest");
  const center = nodes[0] ?? [15.5, 100.2];

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="h-full min-h-72 w-full rounded-[22px]"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Fit points={nodes} />
      <Polyline positions={nodes} pathOptions={{ color: "#12233a", weight: 4, opacity: 0.85 }} />
      <Marker position={nodes[0]!} icon={makeIcon("ต้น", "#12233a")}>
        <Popup>{origin.name}</Popup>
      </Marker>
      {waypoints.map((w) => (
        <Marker key={w.id} position={[w.lat, w.lng]} icon={makeIcon("แวะ", "#0b5bd3")}>
          <Popup>{w.name}</Popup>
        </Marker>
      ))}
      {restStops.map((s) => (
        <Marker
          key={`rest-${s.seq}`}
          position={[s.place.lat, s.place.lng]}
          icon={makeIcon("พัก", s.confidence === "unverified" ? "#a61b1b" : "#1f4d7a")}
        >
          <Popup>
            <strong>{s.place.name}</strong>
            <br />
            {s.confidence === "unverified" ? "ยังไม่ยืนยันสถานที่" : "ต้องตรวจสอบจุดจอด"}
          </Popup>
        </Marker>
      ))}
      <Marker
        position={nodes[nodes.length - 1]!}
        icon={makeIcon("ถึง", "#1b6b46")}
      >
        <Popup>{destination.name}</Popup>
      </Marker>
    </MapContainer>
  );
}
