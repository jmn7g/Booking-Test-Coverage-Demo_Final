import { NotificationService } from '../services/notificationService';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    notificationService = new NotificationService();
    // Spy on console.log to verify notifications
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore console.log after each test
    consoleSpy.mockRestore();
  });

  describe('sendBookingCreatedNotification', () => {
    test('should send booking created notification', async () => {
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

    test('should handle empty user ID', async () => {
      // Arrange
      const userId = '';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingCreatedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} created for user ${userId}`
      );
    });

    test('should handle empty booking ID', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = '';

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
    test('should send booking confirmed notification', async () => {
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

    test('should handle empty user ID', async () => {
      // Arrange
      const userId = '';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingConfirmedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} confirmed for user ${userId}`
      );
    });

    test('should handle empty booking ID', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = '';

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
    test('should send booking cancelled notification', async () => {
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

    test('should handle empty user ID', async () => {
      // Arrange
      const userId = '';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingCancelledNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} cancelled for user ${userId}`
      );
    });

    test('should handle empty booking ID', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = '';

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
    test('should send booking completed notification', async () => {
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

    test('should handle empty user ID', async () => {
      // Arrange
      const userId = '';
      const bookingId = 'booking456';

      // Act
      const result = await notificationService.sendBookingCompletedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} completed for user ${userId}`
      );
    });

    test('should handle empty booking ID', async () => {
      // Arrange
      const userId = 'user123';
      const bookingId = '';

      // Act
      const result = await notificationService.sendBookingCompletedNotification(userId, bookingId);

      // Assert
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Notification: Booking ${bookingId} completed for user ${userId}`
      );
    });
  });
});
