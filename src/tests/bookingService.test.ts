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

  test('confirm booking works', async () => {
    // Setup
    const userId = 'user1';
    const itemId = 'hotel_room_101';
    const startDate = new Date('2023-02-01');
    const endDate = new Date('2023-02-05');
    const totalPrice = 300;
    const paymentMethod = 'credit_card';
    
    // Create booking
    const booking = await bookingService.createBooking(
      userId, 
      itemId, 
      startDate, 
      endDate, 
      totalPrice
    );
    
    // Confirm booking
    const confirmedBooking = await bookingService.confirmBooking(booking.id, paymentMethod);
    
    // Verify
    expect(confirmedBooking).toBeDefined();
    expect(confirmedBooking.id).toBe(booking.id);
    expect(confirmedBooking.status).toBe(BookingStatus.CONFIRMED);
    
    // Verify booking can be retrieved and has correct status
    const retrievedBooking = bookingService.getBooking(booking.id);
    expect(retrievedBooking).toBeDefined();
    expect(retrievedBooking?.status).toBe(BookingStatus.CONFIRMED);
  });

  test('cancel booking status', async () => {
    // Setup
    const userId = 'user555';
    const itemId = 'hotel_room_103';
    const startDate = new Date('2023-05-01');
    const endDate = new Date('2023-05-05');
    const totalPrice = 700;
    const paymentMethod = 'credit_card';
    
    // Create booking
    const booking = await bookingService.createBooking(
      userId,
      itemId,
      startDate,
      endDate,
      totalPrice
    );
    
    // Confirm booking first
    const confirmedBooking = await bookingService.confirmBooking(booking.id, paymentMethod);
    expect(confirmedBooking.status).toBe(BookingStatus.CONFIRMED);
    expect(confirmedBooking.paymentId).toBeDefined();
    
    // Cancel booking
    const cancelledBooking = await bookingService.cancelBooking(booking.id);
    
    // Verify booking status using enum
    expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    
    // Verify booking can be retrieved and has correct status
    const retrievedBooking = bookingService.getBooking(booking.id);
    expect(retrievedBooking).toBeDefined();
    expect(retrievedBooking?.status).toBe(BookingStatus.CANCELLED);
    
    // Verify item is available again after cancellation
    const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);
    expect(isAvailable).toBe(true);
  });

  test('the entire booking lifecycle all at once', async () => {
    // Setup
    const userId = 'user777';
    const itemId = 'hotel_room_101';
    const startDate = new Date('2023-07-01');
    const endDate = new Date('2023-07-05');
    const totalPrice = 800;
    const paymentMethod = 'credit_card';
    
    // Create booking
    const booking = await bookingService.createBooking(
      userId, 
      itemId, 
      startDate, 
      endDate, 
      totalPrice
    );
    expect(booking.status).toBe(BookingStatus.PENDING);
    
    // Confirm booking
    const confirmedBooking = await bookingService.confirmBooking(booking.id, paymentMethod);
    expect(confirmedBooking.status).toBe(BookingStatus.CONFIRMED);
    expect(confirmedBooking.paymentId).toBeDefined();
    
    // Cancel booking
    const cancelledBooking = await bookingService.cancelBooking(confirmedBooking.id);
    expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    
    // Verify item is available again after cancellation
    const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);
    expect(isAvailable).toBe(true);
    
    // Test that completing a cancelled booking throws an error
    await expect(
      bookingService.completeBooking(cancelledBooking.id)
    ).rejects.toThrow('Booking cannot be completed');
  });

  // Missing tests for:
  // - PaymentService (completely untested)
  // - InventoryService (completely untested)
  // - NotificationService (completely untested)
  // - Error conditions in BookingService (invalid dates, unavailable items, etc.)
  // - Edge cases around date handling
});
"Add initial tests with low coverage and design issues"
