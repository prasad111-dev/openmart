import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface Loc {
  lat: number
  lng: number
}

interface Props {
  deliveryBoyLocation?: Loc | null
  customerLocation?: Loc | null
  shopLocation?: Loc | null
  deliveryBoyName?: string
  height?: string
}

function isValidLoc(loc: any): loc is Loc {
  return loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng)
}

export default function LiveTrackingMap({ 
  deliveryBoyLocation, 
  customerLocation, 
  shopLocation,
  deliveryBoyName = 'Delivery Partner',
  height = '400px' 
}: Props) {
  
  const center: [number, number] = useMemo(() => {
    if (isValidLoc(deliveryBoyLocation)) return [deliveryBoyLocation.lat, deliveryBoyLocation.lng]
    if (isValidLoc(customerLocation)) return [customerLocation.lat, customerLocation.lng]
    return [20.5937, 78.9629]
  }, [deliveryBoyLocation, customerLocation])

  const validDelivery = isValidLoc(deliveryBoyLocation)
  const validCustomer = isValidLoc(customerLocation)
  const validShop = isValidLoc(shopLocation)

  const routeLine: [number, number][] = validDelivery && validCustomer ? [
    [deliveryBoyLocation!.lat, deliveryBoyLocation!.lng],
    [customerLocation!.lat, customerLocation!.lng]
  ] : []

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <div style={{ height }} className="w-full">
        <MapContainer
          key={`${center[0]}-${center[1]}`}
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {validDelivery && (
            <Marker 
              position={[deliveryBoyLocation!.lat, deliveryBoyLocation!.lng]} 
              icon={deliveryIcon}
            >
              <Popup>{deliveryBoyName} - Live</Popup>
            </Marker>
          )}
          
          {validCustomer && (
            <Marker 
              position={[customerLocation!.lat, customerLocation!.lng]} 
              icon={customerIcon}
            >
              <Popup>Delivery Address</Popup>
            </Marker>
          )}
          
          {validShop && (
            <Marker 
              position={[shopLocation!.lat, shopLocation!.lng]} 
              icon={shopIcon}
            >
              <Popup>Shop</Popup>
            </Marker>
          )}
          
          {routeLine.length > 0 && (
            <Polyline 
              positions={routeLine} 
              color="#f97316" 
              weight={3} 
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>
      
      <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          {validDelivery && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Delivery</span>
            </div>
          )}
          {validCustomer && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
