export type DeliveryStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'

export interface Delivery {
  id: string
  orderId: string
  deliveryBoyId: string
  shopId: string
  status: DeliveryStatus
  deliveryOtp: string | null
  otpVerified: boolean
  pickupTime: string | null
  deliveredTime: string | null
  createdAt: string
  updatedAt: string
}
