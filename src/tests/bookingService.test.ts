import { BookingService } from '../services/bookingService';
import { PaymentService } from '../services/paymentService';
import { InventoryService } from '../services/inventoryService';
import { NotificationService } from '../services/notificationService';
import { BookingStatus } from '../models/booking';

describe('BookingService', () => {
  let bookingService: BookingService;
  let paymentService: PaymentService;
  let inventoryService: InventoryService;
  let notificationService: NotificationService;

  beforeEach(() => {
    paymentService = new PaymentService();
    inventoryService = new InventoryService();
    notificationService = new NotificationService();
    bookingService = new BookingService(
      paymentService,
      inventoryService,
      notificationService
    );
  });

  test('should create a booking', async () => {
    // Setup
    const userId = 'user123';
    const itemId = 'hotel_room_101';
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-05');
    const totalPrice = 500;

    // Execute
    const booking = await bookingService.createBooking(
      userId,
      itemId,
      startDate,
      endDate,
      totalPrice
    );

    // Verify
    expect(booking).toBeDefined();
    expect(booking.userId).toBe(userId);
    expect(booking.itemId).toBe(itemId);
    expect(booking.status).toBe(BookingStatus.PENDING);
  });

  test('should confirm a booking successfully', async () => {
    // Arrange
    const booking = await bookingService.createBooking(
      'user1', 
      'hotel_room_101', 
      new Date('2023-02-01'), 
      new Date('2023-02-05'), 
      300
    );
    
    // Act
    const confirmedBooking = await bookingService.confirmBooking(booking.id, 'credit_card');
    
    // Assert
    expect(confirmedBooking.status).toBe(BookingStatus.CONFIRMED);
    expect(confirmedBooking.paymentId).toBeDefined();
    expect(confirmedBooking.id).toBe(booking.id);
  });

  test('should cancel a confirmed booking', async () => {
    // Arrange
    const booking = await bookingService.createBooking(
      'user555', 
      'hotel_room_103', 
      new Date('2023-05-01'), 
      new Date('2023-05-05'), 
      700
    );
    const confirmedBooking = await bookingService.confirmBooking(booking.id, 'credit_card');
    
    // Act
    const cancelledBooking = await bookingService.cancelBooking(confirmedBooking.id);
    
    // Assert
    expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    
    // Verify the booking can be retrieved and has the correct status
    const retrievedBooking = bookingService.getBooking(booking.id);
    expect(retrievedBooking?.status).toBe(BookingStatus.CANCELLED);
  });

  test('should throw error when trying to complete a cancelled booking', async () => {
    // Arrange
    const booking = await bookingService.createBooking(
      'user777', 
      'hotel_room_101', 
      new Date('2023-07-01'), 
      new Date('2023-07-05'), 
      800
    );
    const confirmedBooking = await bookingService.confirmBooking(booking.id, 'credit_card');
    const cancelledBooking = await bookingService.cancelBooking(confirmedBooking.id);
    
    // Act & Assert
    await expect(bookingService.completeBooking(cancelledBooking.id))
      .rejects.toThrow('Booking cannot be completed');
  });

  test('should get booking by id', async () => {
    // Arrange
    const booking = await bookingService.createBooking(
      'user123', 
      'hotel_room_101', 
      new Date('2023-03-01'), 
      new Date('2023-03-05'), 
      500
    );
    
    // Act
    const retrievedBooking = bookingService.getBooking(booking.id);
    
    // Assert
    expect(retrievedBooking).toBeDefined();
    expect(retrievedBooking?.id).toBe(booking.id);
  });
  
  test('should get bookings by user', async () => {
    // Arrange
    const userId = 'user_for_multiple_bookings';
    await bookingService.createBooking(
      userId, 
      'hotel_room_101', 
      new Date('2023-04-01'), 
      new Date('2023-04-05'), 
      500
    );
    await bookingService.createBooking(
      userId, 
      'hotel_room_102', 
      new Date('2023-05-01'), 
      new Date('2023-05-05'), 
      600
    );
    
    // Act
    const userBookings = bookingService.getBookingsByUser(userId);
    
    // Assert
    expect(userBookings.length).toBe(2);
    expect(userBookings[0].userId).toBe(userId);
    expect(userBookings[1].userId).toBe(userId);
  });
  
  test('should get bookings by item', async () => {
    // Arrange
    // Add the item to inventory first
    const itemId = 'hotel_room_101'; // Use existing item from inventory
    
    // Create bookings with different dates to avoid conflicts
    await bookingService.createBooking(
      'user1', 
      itemId, 
      new Date('2023-06-10'), 
      new Date('2023-06-15'), 
      500
    );
    await bookingService.createBooking(
      'user2', 
      itemId, 
      new Date('2023-07-20'), 
      new Date('2023-07-25'), 
      600
    );
    
    // Act
    const itemBookings = bookingService.getBookingsByItem(itemId);
    
    // Assert
    expect(itemBookings.length).toBe(2);
    expect(itemBookings[0].itemId).toBe(itemId);
    expect(itemBookings[1].itemId).toBe(itemId);
  });
  
  test('should get active bookings by item', async () => {
    // Arrange
    const itemId = 'hotel_room_102'; // Use existing item from inventory
    
    // Create a pending booking with non-overlapping dates
    await bookingService.createBooking(
      'user1', 
      itemId, 
      new Date('2023-11-01'), 
      new Date('2023-11-05'), 
      500
    );
    
    // Create a confirmed booking with non-overlapping dates
    const booking = await bookingService.createBooking(
      'user2', 
      itemId, 
      new Date('2023-12-01'), 
      new Date('2023-12-05'), 
      600
    );
    await bookingService.confirmBooking(booking.id, 'credit_card');
    
    // Create a cancelled booking (should not be active) with non-overlapping dates
    const bookingToCancel = await bookingService.createBooking(
      'user3', 
      itemId, 
      new Date('2024-01-01'), 
      new Date('2024-01-05'), 
      700
    );
    await bookingService.cancelBooking(bookingToCancel.id);
    
    // Act
    const activeBookings = bookingService.getActiveBookingsByItem(itemId);
    
    // Assert
    expect(activeBookings.length).toBe(2);
    expect([BookingStatus.PENDING, BookingStatus.CONFIRMED]).toContain(activeBookings[0].status);
    expect([BookingStatus.PENDING, BookingStatus.CONFIRMED]).toContain(activeBookings[1].status);
  });

  test('should throw error when creating booking with invalid dates', async () => {
    // Arrange
    const startDate = new Date('2023-05-05');
    const endDate = new Date('2023-05-01'); // End date before start date
    
    // Act & Assert
    await expect(bookingService.createBooking(
      'user123',
      'hotel_room_101',
      startDate,
      endDate,
      500
    )).rejects.toThrow('Start date must be before end date');
  });
  
  test('should throw error when confirming non-existent booking', async () => {
    // Act & Assert
    await expect(bookingService.confirmBooking(
      'non_existent_booking_id',
      'credit_card'
    )).rejects.toThrow('Booking not found');
  });
  
  test('should throw error when cancelling non-existent booking', async () => {
    // Act & Assert
    await expect(bookingService.cancelBooking(
      'non_existent_booking_id'
    )).rejects.toThrow('Booking not found');
  });
  
  test('should throw error when completing booking before end date', async () => {
    // Arrange
    const futureEndDate = new Date();
    futureEndDate.setDate(futureEndDate.getDate() + 10); // 10 days in the future
    
    const booking = await bookingService.createBooking(
      'user123',
      'hotel_room_101',
      new Date(),
      futureEndDate,
      500
    );
    
    const confirmedBooking = await bookingService.confirmBooking(booking.id, 'credit_card');
    
    // Act & Assert
    await expect(bookingService.completeBooking(confirmedBooking.id))
      .rejects.toThrow('Booking end date has not passed yet');
  });

  // Missing tests for:
  // - PaymentService (completely untested)
  // - InventoryService (completely untested)
  // - NotificationService (completely untested)
  // - Error conditions in BookingService (invalid dates, unavailable items, etc.)
  // - Edge cases around date handling
});
"Add initial tests with low coverage and design issues"
