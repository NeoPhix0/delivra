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
    .filter(m => m.latitude && m.longitude)
    .map(m => `
      L.marker([${m.latitude}, ${m.longitude}])
        .addTo(map)
        .bindPopup('${m.emoji || '📍'} ${m.title || ''}');
    `).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: ${zoomEnabled},
          dragging: ${scrollEnabled},
          scrollWheelZoom: false,
        }).setView([${region.latitude}, ${region.longitude}], ${zoom});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        ${markersJs}
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