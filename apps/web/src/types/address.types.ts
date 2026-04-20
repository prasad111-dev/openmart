export interface Address {
  id: string
  userId: string
  label: string
  street: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  latitude: number | null
  longitude: number | null
  createdAt: string
  updatedAt: string
}
