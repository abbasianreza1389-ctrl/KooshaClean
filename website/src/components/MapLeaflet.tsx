"use client";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const MapContainer = dynamic(()=>import("react-leaflet").then(m=>m.MapContainer),{ssr:false});
const TileLayer    = dynamic(()=>import("react-leaflet").then(m=>m.TileLayer),{ssr:false});
const Circle       = dynamic(()=>import("react-leaflet").then(m=>m.Circle),{ssr:false});
export default function MapLeaflet({ center=[35.715,51.404], zoom=13 }:{ center?:[number,number]; zoom?:number }){
  const [ready,setReady] = useState(false); useEffect(()=>setReady(true),[]);
  if(!ready) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={zoom} style={{height:320, width:"100%"}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle center={center} radius={120} pathOptions={{ color:"#0284c7" }} />
      </MapContainer>
    </div>
  );
}
