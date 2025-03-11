import { NotificationService } from '../services/notificationService';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    notificationService = new NotificationService();
    // Spy on console.log to verify notifications
    consoleSpy = jest.spyOn(console, 'log');
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('sendBookingCreatedNotification', () => {
    test('should send booking created notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingCreatedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} created for user ${userId}`
      );
    });
  });

  describe('sendBookingConfirmedNotification', () => {
    test('should send booking confirmed notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingConfirmedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} confirmed for user ${userId}`
      );
    });
  });

  describe('sendBookingCancelledNotification', () => {
    test('should send booking cancelled notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingCancelledNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} cancelled for user ${userId}`
      );
    });
  });

  describe('sendBookingCompletedNotification', () => {
    test('should send booking completed notification and return true', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingCompletedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} completed for user ${userId}`
      );
    });
  });

  test('should handle all notification types correctly', async () => {
    // Arrange
    const userId = 'user999';
    const bookingId = 'booking888';
    
    // Act & Assert - Test all notification methods in sequence
    
    // Created notification
    await notificationService.sendBookingCreatedNotification(userId, bookingId);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      `Notification: Booking ${bookingId} created for user ${userId}`
    );
    
    // Confirmed notification
    await notificationService.sendBookingConfirmedNotification(userId, bookingId);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      `Notification: Booking ${bookingId} confirmed for user ${userId}`
    );
    
    // Cancelled notification
    await notificationService.sendBookingCancelledNotification(userId, bookingId);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      `Notification: Booking ${bookingId} cancelled for user ${userId}`
    );
    
    // Completed notification
    await notificationService.sendBookingCompletedNotification(userId, bookingId);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      `Notification: Booking ${bookingId} completed for user ${userId}`
    );
  });
});
