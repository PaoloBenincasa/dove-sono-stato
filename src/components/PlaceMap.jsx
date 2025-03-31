import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PlaceMap = ({ lat, lon, displayName }) => {
    console.log("lat:", lat, "lon:", lon); // Aggiungi questo log

    return (
        <MapContainer center={[lat, lon]} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lon]} icon={L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: red; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })}>
                <Popup>{displayName}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default PlaceMap;

