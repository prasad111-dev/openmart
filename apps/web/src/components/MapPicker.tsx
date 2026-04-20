import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Crosshair } from 'lucide-react'
import { useToastError } from '@/hooks/useToastAlerts'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? <Marker position={position} /> : null
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 15)
  }, [center, map])
  return null
}

export default function MapPicker({ onLocationSelect, initialLat = 20.5937, initialLng = 78.9629, height = '300px' }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [center, setCenter] = useState<[number, number]>([initialLat, initialLng])
  const [loading, setLoading] = useState(false)
  const toastError = useToastError()

  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1])
    }
  }, [position])

  const getCurrentLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setPosition([lat, lng])
          setCenter([lat, lng])
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          toastError('Could not get your location. Please select on map.')
          setLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      toastError('Geolocation is not supported by your browser')
      setLoading(false)
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <div style={{ height }} className="w-full">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapUpdater center={center} />
        </MapContainer>
      </div>
      
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="absolute bottom-3 right-3 z-[1000] shadow-lg"
        onClick={getCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Crosshair className="w-4 h-4 mr-2" />
        )}
        My Location
      </Button>

      {position && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs shadow-lg">
          📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  )
}
