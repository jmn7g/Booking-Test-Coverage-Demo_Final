import { NotificationService } from '../services/notificationService';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    notificationService = new NotificationService();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should send booking created notification', async () => {
    // Act
    const result = await notificationService.sendBookingCreatedNotification(
      'user123',
      'booking123'
    );

    // Assert
    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Notification: Booking booking123 created for user user123'
    );
  });

  test('should send booking confirmed notification', async () => {
    // Act
    const result = await notificationService.sendBookingConfirmedNotification(
      'user123',
      'booking123'
    );

    // Assert
    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Notification: Booking booking123 confirmed for user user123'
    );
  });

  test('should send booking cancelled notification', async () => {
    // Act
    const result = await notificationService.sendBookingCancelledNotification(
      'user123',
      'booking123'
    );

    // Assert
    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Notification: Booking booking123 cancelled for user user123'
    );
  });

  test('should send booking completed notification', async () => {
    // Act
    const result = await notificationService.sendBookingCompletedNotification(
      'user123',
      'booking123'
    );

    // Assert
    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Notification: Booking booking123 completed for user user123'
    );
  });
});
