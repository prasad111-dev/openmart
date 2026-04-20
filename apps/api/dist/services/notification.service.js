import prisma from '../lib/db.js';
/**
 * WhatsApp Notification Service
 *
 * MVP: Creates notification records in DB for later delivery.
 *
 * Production: Integrate with Twilio WhatsApp API or WhatsApp Business API.
 *
 * Setup:
 * 1. Install: bun add twilio
 * 2. Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
 * 3. Uncomment the Twilio code below
 */
// import twilio from 'twilio'
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
export async function sendNotification(payload) {
    // Always create notification record in DB
    const notification = await prisma.notification.create({
        data: {
            userId: payload.userId,
            type: payload.type,
            channel: (payload.channel || 'WHATSAPP'),
            content: payload.content,
            status: 'PENDING',
        },
    });
    // MVP: Log notification (replace with actual sending in production)
    console.log(`[Notification] ${payload.type} -> User ${payload.userId}: ${payload.content}`);
    // Production: Send via WhatsApp
    // try {
    //   const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    //   if (!user?.phone) {
    //     await prisma.notification.update({
    //       where: { id: notification.id },
    //       data: { status: 'FAILED', attempts: { increment: 1 } },
    //     })
    //     return notification
    //   }
    //
    //   const message = await twilioClient.messages.create({
    //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //     to: `whatsapp:${user.phone}`,
    //     body: payload.content,
    //   })
    //
    //   await prisma.notification.update({
    //     where: { id: notification.id },
    //     data: {
    //       status: 'SENT',
    //       providerResponse: { sid: message.sid },
    //       attempts: { increment: 1 },
    //     },
    //   })
    // } catch (error: any) {
    //   await prisma.notification.update({
    //     where: { id: notification.id },
    //     data: {
    //       status: 'FAILED',
    //       providerResponse: { error: error.message },
    //       attempts: { increment: 1 },
    //     },
    //   })
    // }
    // Mark as sent for MVP (no actual sending)
    await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', attempts: { increment: 1 } },
    });
    return notification;
}
export async function sendOrderStatusUpdate(userId, orderId, status) {
    return sendNotification({
        userId,
        type: 'ORDER_STATUS_UPDATE',
        content: `Your order #${orderId.slice(0, 8)} status has been updated to: ${status}`,
    });
}
export async function sendShopApproval(userId, shopName, approved) {
    return sendNotification({
        userId,
        type: approved ? 'SHOP_APPROVAL' : 'SHOP_REJECTION',
        content: approved
            ? `Congratulations! Your shop "${shopName}" has been approved.`
            : `Your shop "${shopName}" application has been rejected.`,
    });
}
export async function sendDeliveryAssignment(deliveryBoyId, orderId) {
    return sendNotification({
        userId: deliveryBoyId,
        type: 'DELIVERY_ASSIGNMENT',
        content: `You have been assigned a new delivery for order #${orderId.slice(0, 8)}.`,
    });
}
export async function sendOTP(userId, otp) {
    return sendNotification({
        userId,
        type: 'OTP_VERIFICATION',
        content: `Your verification code is: ${otp}. Valid for 10 minutes.`,
    });
}
