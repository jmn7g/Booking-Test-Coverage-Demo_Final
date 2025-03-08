export class NotificationService {
  async sendBookingCreatedNotification(userId: string, bookingId: string): Promise<boolean> {
    console.log(`Notification: Booking ${bookingId} created for user ${userId}`);
    return true;
  }

  async sendBookingConfirmedNotification(userId: string, bookingId: string): Promise<boolean> {
    console.log(`Notification: Booking ${bookingId} confirmed for user ${userId}`);
    return true;
  }

  async sendBookingCancelledNotification(userId: string, bookingId: string): Promise<boolean> {
    console.log(`Notification: Booking ${bookingId} cancelled for user ${userId}`);
    return true;
  }

  async sendBookingCompletedNotification(userId: string, bookingId: string): Promise<boolean> {
    console.log(`Notification: Booking ${bookingId} completed for user ${userId}`);
    return true;
  }
}
"Add notification service"
