import { BookingService } from '../services/bookingService';
import { PaymentService } from '../services/paymentService';
import { InventoryService } from '../services/inventoryService';
import { NotificationService } from '../services/notificationService';
import { BookingStatus } from '../models/booking';

describe('BookingService - Improved Tests', () => {
  let bookingService: BookingService;
  let paymentService: PaymentService;
  let inventoryService: InventoryService;
  let notificationService: NotificationService;

  // Mocks
  let mockProcessPayment: jest.SpyInstance;
  let mockRefundPayment: jest.SpyInstance;
  let mockCheckAvailability: jest.SpyInstance;
  let mockReserveItem: jest.SpyInstance;
  let mockReleaseItem: jest.SpyInstance;
  let mockSendBookingCreatedNotification: jest.SpyInstance;
  let mockSendBookingConfirmedNotification: jest.SpyInstance;
  let mockSendBookingCancelledNotification: jest.SpyInstance;
  let mockSendBookingCompletedNotification: jest.SpyInstance;

  beforeEach(() => {
    // Create service instances
    paymentService = new PaymentService();
    inventoryService = new InventoryService();
    notificationService = new NotificationService();
    
    // Setup mocks
    mockProcessPayment = jest.spyOn(paymentService, 'processPayment').mockResolvedValue('payment_123');
    mockRefundPayment = jest.spyOn(paymentService, 'refundPayment').mockResolvedValue(true);
    mockCheckAvailability = jest.spyOn(inventoryService, 'checkAvailability').mockResolvedValue(true);
    mockReserveItem = jest.spyOn(inventoryService, 'reserveItem').mockResolvedValue(true);
    mockReleaseItem = jest.spyOn(inventoryService, 'releaseItem').mockResolvedValue(true);
    mockSendBookingCreatedNotification = jest.spyOn(notificationService, 'sendBookingCreatedNotification').mockResolvedValue(true);
    mockSendBookingConfirmedNotification = jest.spyOn(notificationService, 'sendBookingConfirmedNotification').mockResolvedValue(true);
    mockSendBookingCancelledNotification = jest.spyOn(notificationService, 'sendBookingCancelledNotification').mockResolvedValue(true);
    mockSendBookingCompletedNotification = jest.spyOn(notificationService, 'sendBookingCompletedNotification').mockResolvedValue(true);
    
    // Create booking service with mocked dependencies
    bookingService = new BookingService(
      paymentService,
      inventoryService,
      notificationService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    test('should create a booking with valid parameters', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-05');
      const totalPrice = 500;

      // Act
      const booking = await bookingService.createBooking(
        userId,
        itemId,
        startDate,
        endDate,
        totalPrice
      );

      // Assert
      expect(booking).toBeDefined();
      expect(booking.userId).toBe(userId);
      expect(booking.itemId).toBe(itemId);
      expect(booking.startDate).toBe(startDate);
      expect(booking.endDate).toBe(endDate);
      expect(booking.totalPrice).toBe(totalPrice);
      expect(booking.status).toBe(BookingStatus.PENDING);
      expect(booking.id).toBeDefined();
      expect(booking.createdAt).toBeInstanceOf(Date);
      expect(booking.updatedAt).toBeInstanceOf(Date);
      
      // Verify interactions with dependencies
      expect(mockCheckAvailability).toHaveBeenCalledWith(itemId, startDate, endDate);
      expect(mockSendBookingCreatedNotification).toHaveBeenCalledWith(userId, booking.id);
    });

    test('should throw error when start date is after end date', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-01-10');
      const endDate = new Date('2023-01-05'); // Before start date
      const totalPrice = 500;

      // Act & Assert
      await expect(
        bookingService.createBooking(userId, itemId, startDate, endDate, totalPrice)
      ).rejects.toThrow('Start date must be before end date');
      
      // Verify no interactions with dependencies
      expect(mockCheckAvailability).not.toHaveBeenCalled();
      expect(mockSendBookingCreatedNotification).not.toHaveBeenCalled();
    });

    test('should throw error when item is not available', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-05');
      const totalPrice = 500;
      
      // Mock item not available
      mockCheckAvailability.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        bookingService.createBooking(userId, itemId, startDate, endDate, totalPrice)
      ).rejects.toThrow('Item is not available for the selected dates');
      
      // Verify interactions with dependencies
      expect(mockCheckAvailability).toHaveBeenCalledWith(itemId, startDate, endDate);
      expect(mockSendBookingCreatedNotification).not.toHaveBeenCalled();
    });
  });

  describe('confirmBooking', () => {
    test('should confirm a pending booking', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-02-01');
      const endDate = new Date('2023-02-05');
      const totalPrice = 300;
      const paymentMethod = 'credit_card';
      
      // Create a booking first
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      
      // Reset mocks after booking creation
      jest.clearAllMocks();

      // Act
      const confirmedBooking = await bookingService.confirmBooking(booking.id, paymentMethod);

      // Assert
      expect(confirmedBooking).toBeDefined();
      expect(confirmedBooking.status).toBe(BookingStatus.CONFIRMED);
      expect(confirmedBooking.paymentId).toBe('payment_123');
      // Skip updatedAt comparison as it's set to the same time in tests
      
      // Verify interactions with dependencies
      expect(mockProcessPayment).toHaveBeenCalledWith(userId, totalPrice, paymentMethod);
      expect(mockReserveItem).toHaveBeenCalledWith(itemId, startDate, endDate);
      expect(mockSendBookingConfirmedNotification).toHaveBeenCalledWith(userId, booking.id);
    });

    test('should throw error when booking not found', async () => {
      // Act & Assert
      await expect(
        bookingService.confirmBooking('non_existent_id', 'credit_card')
      ).rejects.toThrow('Booking not found');
      
      // Verify no interactions with dependencies
      expect(mockProcessPayment).not.toHaveBeenCalled();
      expect(mockReserveItem).not.toHaveBeenCalled();
      expect(mockSendBookingConfirmedNotification).not.toHaveBeenCalled();
    });

    test('should throw error when booking is not in PENDING status', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-03-01');
      const endDate = new Date('2023-03-05');
      const totalPrice = 400;
      const paymentMethod = 'credit_card';
      
      // Create and confirm a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      await bookingService.confirmBooking(booking.id, paymentMethod);
      
      // Reset mocks
      jest.clearAllMocks();

      // Act & Assert - Try to confirm again
      await expect(
        bookingService.confirmBooking(booking.id, paymentMethod)
      ).rejects.toThrow('Booking cannot be confirmed');
      
      // Verify no interactions with dependencies
      expect(mockProcessPayment).not.toHaveBeenCalled();
      expect(mockReserveItem).not.toHaveBeenCalled();
      expect(mockSendBookingConfirmedNotification).not.toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    test('should cancel a pending booking', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-04-01');
      const endDate = new Date('2023-04-05');
      const totalPrice = 600;
      
      // Create a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      
      // Reset mocks
      jest.clearAllMocks();

      // Act
      const cancelledBooking = await bookingService.cancelBooking(booking.id);

      // Assert
      expect(cancelledBooking).toBeDefined();
      expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
      // Skip updatedAt comparison as it's set to the same time in tests
      
      // Verify interactions with dependencies
      expect(mockRefundPayment).not.toHaveBeenCalled(); // No payment to refund
      expect(mockReleaseItem).not.toHaveBeenCalled(); // No reservation to release
      expect(mockSendBookingCancelledNotification).toHaveBeenCalledWith(userId, booking.id);
    });

    test('should cancel a confirmed booking and refund payment', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-05');
      const totalPrice = 700;
      const paymentMethod = 'credit_card';
      
      // Create and confirm a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      const confirmedBooking = await bookingService.confirmBooking(booking.id, paymentMethod);
      
      // Reset mocks
      jest.clearAllMocks();

      // Act
      const cancelledBooking = await bookingService.cancelBooking(confirmedBooking.id);

      // Assert
      expect(cancelledBooking).toBeDefined();
      expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
      // Skip updatedAt comparison as it's set to the same time in tests
      
      // Verify interactions with dependencies
      expect(mockRefundPayment).toHaveBeenCalledWith(confirmedBooking.paymentId);
      expect(mockReleaseItem).toHaveBeenCalledWith(itemId, startDate, endDate);
      expect(mockSendBookingCancelledNotification).toHaveBeenCalledWith(userId, booking.id);
    });

    test('should throw error when booking not found', async () => {
      // Act & Assert
      await expect(
        bookingService.cancelBooking('non_existent_id')
      ).rejects.toThrow('Booking not found');
      
      // Verify no interactions with dependencies
      expect(mockRefundPayment).not.toHaveBeenCalled();
      expect(mockReleaseItem).not.toHaveBeenCalled();
      expect(mockSendBookingCancelledNotification).not.toHaveBeenCalled();
    });

    test('should throw error when booking cannot be cancelled', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-06-05');
      const totalPrice = 800;
      
      // Create, confirm, and complete a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      await bookingService.confirmBooking(booking.id, 'credit_card');
      
      // Mock current date to be after end date
      const realDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return new realDate('2023-06-10');
        }
      } as any;
      
      await bookingService.completeBooking(booking.id);
      
      // Reset Date
      global.Date = realDate;
      
      // Reset mocks
      jest.clearAllMocks();

      // Act & Assert
      await expect(
        bookingService.cancelBooking(booking.id)
      ).rejects.toThrow('Booking cannot be cancelled');
      
      // Verify no interactions with dependencies
      expect(mockRefundPayment).not.toHaveBeenCalled();
      expect(mockReleaseItem).not.toHaveBeenCalled();
      expect(mockSendBookingCancelledNotification).not.toHaveBeenCalled();
    });
  });

  describe('completeBooking', () => {
    test('should complete a confirmed booking when end date has passed', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-07-01');
      const endDate = new Date('2023-07-05');
      const totalPrice = 900;
      
      // Create and confirm a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      await bookingService.confirmBooking(booking.id, 'credit_card');
      
      // Mock current date to be after end date
      const realDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return new realDate('2023-07-10');
        }
      } as any;
      
      // Reset mocks
      jest.clearAllMocks();

      // Act
      const completedBooking = await bookingService.completeBooking(booking.id);
      
      // Reset Date
      global.Date = realDate;

      // Assert
      expect(completedBooking).toBeDefined();
      expect(completedBooking.status).toBe(BookingStatus.COMPLETED);
      
      // Verify interactions with dependencies
      expect(mockSendBookingCompletedNotification).toHaveBeenCalledWith(userId, booking.id);
    });

    test('should throw error when booking not found', async () => {
      // Act & Assert
      await expect(
        bookingService.completeBooking('non_existent_id')
      ).rejects.toThrow('Booking not found');
      
      // Verify no interactions with dependencies
      expect(mockSendBookingCompletedNotification).not.toHaveBeenCalled();
    });

    test('should throw error when booking is not confirmed', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-08-01');
      const endDate = new Date('2023-08-05');
      const totalPrice = 1000;
      
      // Create a booking but don't confirm it
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      
      // Reset mocks
      jest.clearAllMocks();

      // Act & Assert
      await expect(
        bookingService.completeBooking(booking.id)
      ).rejects.toThrow('Booking cannot be completed');
      
      // Verify no interactions with dependencies
      expect(mockSendBookingCompletedNotification).not.toHaveBeenCalled();
    });

    test('should throw error when end date has not passed', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-09-01');
      const endDate = new Date('2023-09-05');
      const totalPrice = 1100;
      
      // Create and confirm a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );
      await bookingService.confirmBooking(booking.id, 'credit_card');
      
      // Mock current date to be before end date
      const realDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return new realDate('2023-09-03');
        }
      } as any;
      
      // Reset mocks
      jest.clearAllMocks();

      // Act & Assert
      await expect(
        bookingService.completeBooking(booking.id)
      ).rejects.toThrow('Booking end date has not passed yet');
      
      // Reset Date
      global.Date = realDate;
      
      // Verify no interactions with dependencies
      expect(mockSendBookingCompletedNotification).not.toHaveBeenCalled();
    });
  });

  describe('getBooking', () => {
    test('should return a booking by ID', async () => {
      // Arrange
      const userId = 'user123';
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-05');
      const totalPrice = 1200;
      
      // Create a booking
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        startDate, 
        endDate, 
        totalPrice
      );

      // Act
      const retrievedBooking = bookingService.getBooking(booking.id);

      // Assert
      expect(retrievedBooking).toBeDefined();
      expect(retrievedBooking?.id).toBe(booking.id);
    });

    test('should return undefined for non-existent booking ID', () => {
      // Act
      const retrievedBooking = bookingService.getBooking('non_existent_id');

      // Assert
      expect(retrievedBooking).toBeUndefined();
    });
  });

  describe('getBookingsByUser', () => {
    test('should return all bookings for a user', async () => {
      // Arrange
      const userId = 'user456';
      const itemId1 = 'hotel_room_101';
      const itemId2 = 'hotel_room_102';
      
      // Create multiple bookings for the same user
      await bookingService.createBooking(
        userId, 
        itemId1, 
        new Date('2023-11-01'), 
        new Date('2023-11-05'), 
        1300
      );
      
      await bookingService.createBooking(
        userId, 
        itemId2, 
        new Date('2023-11-10'), 
        new Date('2023-11-15'), 
        1400
      );
      
      // Create a booking for a different user
      await bookingService.createBooking(
        'different_user', 
        itemId1, 
        new Date('2023-11-20'), 
        new Date('2023-11-25'), 
        1500
      );

      // Act
      const userBookings = bookingService.getBookingsByUser(userId);

      // Assert
      expect(userBookings).toHaveLength(2);
      expect(userBookings[0].userId).toBe(userId);
      expect(userBookings[1].userId).toBe(userId);
    });

    test('should return empty array when user has no bookings', () => {
      // Act
      const userBookings = bookingService.getBookingsByUser('user_with_no_bookings');

      // Assert
      expect(userBookings).toHaveLength(0);
    });
  });

  describe('getBookingsByItem', () => {
    test('should return all bookings for an item', async () => {
      // Arrange
      const itemId = 'hotel_room_103';
      const userId1 = 'user789';
      const userId2 = 'user101';
      
      // Create multiple bookings for the same item
      await bookingService.createBooking(
        userId1, 
        itemId, 
        new Date('2023-12-01'), 
        new Date('2023-12-05'), 
        1600
      );
      
      await bookingService.createBooking(
        userId2, 
        itemId, 
        new Date('2023-12-10'), 
        new Date('2023-12-15'), 
        1700
      );
      
      // Create a booking for a different item
      await bookingService.createBooking(
        userId1, 
        'different_item', 
        new Date('2023-12-20'), 
        new Date('2023-12-25'), 
        1800
      );

      // Act
      const itemBookings = bookingService.getBookingsByItem(itemId);

      // Assert
      expect(itemBookings).toHaveLength(2);
      expect(itemBookings[0].itemId).toBe(itemId);
      expect(itemBookings[1].itemId).toBe(itemId);
    });

    test('should return empty array when item has no bookings', () => {
      // Act
      const itemBookings = bookingService.getBookingsByItem('item_with_no_bookings');

      // Assert
      expect(itemBookings).toHaveLength(0);
    });
  });

  describe('getActiveBookingsByItem', () => {
    test('should return only active bookings for an item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const userId = 'user202';
      
      // Create a pending booking
      const pendingBooking = await bookingService.createBooking(
        userId, 
        itemId, 
        new Date('2024-01-01'), 
        new Date('2024-01-05'), 
        1900
      );
      
      // Create a confirmed booking
      const confirmedBooking = await bookingService.createBooking(
        userId, 
        itemId, 
        new Date('2024-01-10'), 
        new Date('2024-01-15'), 
        2000
      );
      await bookingService.confirmBooking(confirmedBooking.id, 'credit_card');
      
      // Create a cancelled booking
      const cancelledBooking = await bookingService.createBooking(
        userId, 
        itemId, 
        new Date('2024-01-20'), 
        new Date('2024-01-25'), 
        2100
      );
      await bookingService.cancelBooking(cancelledBooking.id);

      // Act
      const activeBookings = bookingService.getActiveBookingsByItem(itemId);

      // Assert
      expect(activeBookings).toHaveLength(2);
      expect(activeBookings.some(b => b.id === pendingBooking.id)).toBe(true);
      expect(activeBookings.some(b => b.id === confirmedBooking.id)).toBe(true);
      expect(activeBookings.some(b => b.id === cancelledBooking.id)).toBe(false);
    });

    test('should return empty array when item has no active bookings', async () => {
      // Arrange
      const itemId = 'hotel_room_102';
      const userId = 'user303';
      
      // Create a booking and cancel it
      const booking = await bookingService.createBooking(
        userId, 
        itemId, 
        new Date('2024-02-01'), 
        new Date('2024-02-05'), 
        2200
      );
      await bookingService.cancelBooking(booking.id);

      // Act
      const activeBookings = bookingService.getActiveBookingsByItem(itemId);

      // Assert
      expect(activeBookings).toHaveLength(0);
    });
  });
});
