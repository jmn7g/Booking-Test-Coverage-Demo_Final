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

  // BAD TEST #1: No assertions, doesn't actually test anything meaningful
  test('confirm booking works', async () => {
    const booking = await bookingService.createBooking(
      'user1', 
      'hotel_room_101', 
      new Date('2023-02-01'), 
      new Date('2023-02-05'), 
      300
    );
    
    // This test doesn't actually assert anything after confirmation!
    await bookingService.confirmBooking(booking.id, 'credit_card');
    // Missing assertions about booking state
  });

  // BAD TEST #2: Test with time dependency that could fail randomly
  test('complete booking after end date', async () => {
    // Using real current date - this will eventually fail as time passes
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10); // 10 days ago
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    
    const booking = await bookingService.createBooking(
      'user555', 
      'hotel_room_103', 
      startDate, 
      endDate, 
      700
    );
    
    await bookingService.confirmBooking(booking.id, 'credit_card');
    const completedBooking = await bookingService.completeBooking(booking.id);
    
    expect(completedBooking.status).toBe(BookingStatus.COMPLETED);
  });

  // BAD TEST #3: Mixes multiple concerns in one test, makes it hard to debug
  test('the entire booking lifecycle all at once', async () => {
    // This test tries to test everything in one go
    const booking = await bookingService.createBooking(
      'user777', 
      'hotel_room_101', 
      new Date('2023-07-01'), 
      new Date('2023-07-05'), 
      800
    );
    
    const confirmedBooking = await bookingService.confirmBooking(booking.id, 'credit_card');
    expect(confirmedBooking.status).toBe(BookingStatus.CONFIRMED);
    
    // Some assertions here...
    
    const cancelledBooking = await bookingService.cancelBooking(confirmedBooking.id);
    expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    
    // More assertions...
    
    // Invalid test - can't complete a cancelled booking, but the test doesn't handle
    // this exception correctly
    try {
      await bookingService.completeBooking(cancelledBooking.id);
      // Should fail but doesn't assert the error
    } catch (e) {
      // No assertion on the error message
    }
  });

  // Missing tests for:
  // - PaymentService (completely untested)
  // - InventoryService (completely untested)
  // - NotificationService (completely untested)
  // - Error conditions in BookingService (invalid dates, unavailable items, etc.)
  // - Edge cases around date handling
});
"Add initial tests with low coverage and design issues"
