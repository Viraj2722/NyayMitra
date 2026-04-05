"use client";

import { useEffect } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type CenterMarker = {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

type UserLocation = {
  lat: number;
  lng: number;
};

type Props = {
  centers: CenterMarker[];
  userLocation: UserLocation | null;
};

const centerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "nyaymitra-user-pin",
  html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#16a34a;border:2px solid #ffffff;box-shadow:0 0 0 2px rgba(22,163,74,0.25);"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitToMarkers({
  centers,
  userLocation,
}: {
  centers: CenterMarker[];
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: Array<[number, number]> = centers.map((center) => [
      center.latitude,
      center.longitude,
    ]);

    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length === 0) {
      map.setView([20.5937, 78.9629], 4);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [28, 28] });
  }, [centers, userLocation, map]);

  return null;
}

export default function LegalCentersMap({ centers, userLocation }: Props) {
  const initialCenter =
    userLocation != null
      ? ([userLocation.lat, userLocation.lng] as [number, number])
      : centers.length > 0
        ? ([centers[0].latitude, centers[0].longitude] as [number, number])
        : ([20.5937, 78.9629] as [number, number]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToMarkers centers={centers} userLocation={userLocation} />

      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={1200}
            pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.12 }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-semibold">Your location</div>
            </Popup>
          </Marker>
        </>
      )}

      {centers.map((center) => (
        <Marker
          key={center.id}
          position={[center.latitude, center.longitude]}
          icon={centerIcon}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-sm">{center.name}</p>
              <p className="text-xs text-zinc-600">{center.address}</p>
              <p className="text-xs text-zinc-700 font-medium">{center.phone}</p>
              {typeof center.distance === "number" && (
                <p className="text-xs text-emerald-700 font-semibold">
                  {center.distance.toFixed(2)} km away
                </p>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                Open in Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
