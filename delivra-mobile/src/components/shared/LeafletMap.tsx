import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
  latitude: number;
  longitude: number;
  title?: string;
  emoji?: string;
}

interface Props {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  markers?: Marker[];
  style?: ViewStyle;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
}

export default function LeafletMap({ region, markers = [], style, scrollEnabled = true, zoomEnabled = true }: Props) {
  if (!region || region.latitude == null || region.longitude == null || 
      isNaN(region.latitude) || isNaN(region.longitude)) {
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }, style]}>
        <Text style={{ color: '#666' }}>Loading map...</Text>
      </View>
    );
  }

  const zoom = 15;

  const markersJs = markers
    .filter(m => m.latitude != null && m.longitude != null)
    .map(m => `
      L.marker([${m.latitude}, ${m.longitude}], {
        icon: L.divIcon({
          html: '<div style="font-size:28px;line-height:1;">${m.emoji || '📍'}</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          className: ''
        })
      })
        .addTo(map)
        .bindPopup('${m.title || ''}');
    `).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
              crossorigin=""></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="error" style="display:none;color:red;padding:10px;">Map failed to load</div>
      <script>
        window.onerror = function(msg) {
          var el = document.getElementById('error');
          if (el) { el.style.display = 'block'; el.innerText = 'Error: ' + msg; }
        }
        document.addEventListener('DOMContentLoaded', function() {
          // Fix Leaflet default icon paths broken in WebView
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });

          var map = L.map('map', {
            zoomControl: ${zoomEnabled},
            dragging: ${scrollEnabled},
            scrollWheelZoom: false,
          }).setView([${region.latitude}, ${region.longitude}], ${zoom});

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            crossOrigin: true,
          }).addTo(map);

          ${markersJs}
        });
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      style={[styles.map, style]}
      scrollEnabled={false}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      cacheEnabled={true}
      mixedContentMode="always"
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      onError={(e) => console.error('WebView error:', e.nativeEvent)}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});