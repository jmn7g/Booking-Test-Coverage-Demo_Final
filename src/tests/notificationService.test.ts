import { NotificationService } from '../services/notificationService';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    notificationService = new NotificationService();
    // Spy on console.log to verify notifications
    consoleLogSpy = jest.spyOn(console, 'log');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('sendBookingCreatedNotification', () => {
    test('should log booking created notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';
      
      // Act
      const result = await notificationService.sendBookingCreatedNotification(userId, bookingId);
      
      // Assert
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} created for user ${userId}`
      );
    });
  });

  describe('sendBookingConfirmedNotification', () => {
    test('should log booking confirmed notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';
      
      // Act
      const result = await notificationService.sendBookingConfirmedNotification(userId, bookingId);
      
      // Assert
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} confirmed for user ${userId}`
      );
    });
  });

  describe('sendBookingCancelledNotification', () => {
    test('should log booking cancelled notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';
      
      // Act
      const result = await notificationService.sendBookingCancelledNotification(userId, bookingId);
      
      // Assert
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} cancelled for user ${userId}`
      );
    });
  });

  describe('sendBookingCompletedNotification', () => {
    test('should log booking completed notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';
      
      // Act
      const result = await notificationService.sendBookingCompletedNotification(userId, bookingId);
      
      // Assert
      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} completed for user ${userId}`
      );
    });
  });
});
