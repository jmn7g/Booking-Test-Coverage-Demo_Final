import { InventoryService } from '../services/inventoryService';

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
  });

  describe('checkAvailability', () => {
    test('should return true for available item with no reservations', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-05');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(true);
    });

    test('should return false for non-existent item', async () => {
      // Arrange
      const itemId = 'non_existent_room';
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-05');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return false for inactive item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-05');

      // Make item inactive
      // @ts-ignore - Accessing private property for testing
      inventoryService.inventory.set(itemId, false);

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return false when dates overlap with existing reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      
      // First reserve the item
      const existingStartDate = new Date('2023-05-03');
      const existingEndDate = new Date('2023-05-07');
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Now check availability for overlapping dates
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-04');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return true when dates do not overlap with existing reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      
      // First reserve the item
      const existingStartDate = new Date('2023-05-10');
      const existingEndDate = new Date('2023-05-15');
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Now check availability for non-overlapping dates
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-05');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(true);
    });
  });

  describe('reserveItem', () => {
    test('should successfully reserve an available item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-06-05');

      // Act
      const result = await inventoryService.reserveItem(itemId, startDate, endDate);

      // Assert
      expect(result).toBe(true);
      
      // Verify the reservation was added
      // @ts-ignore - Accessing private property for testing
      const reservations = inventoryService.reservations.get(itemId);
      expect(reservations).toBeDefined();
      expect(reservations?.length).toBeGreaterThan(0);
      expect(reservations?.some(r => 
        r.startDate.getTime() === startDate.getTime() && 
        r.endDate.getTime() === endDate.getTime()
      )).toBe(true);
    });

    test('should throw error when trying to reserve an unavailable item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate1 = new Date('2023-07-01');
      const endDate1 = new Date('2023-07-10');
      
      // First reservation
      await inventoryService.reserveItem(itemId, startDate1, endDate1);
      
      // Overlapping dates for second reservation
      const startDate2 = new Date('2023-07-05');
      const endDate2 = new Date('2023-07-15');

      // Act & Assert
      await expect(
        inventoryService.reserveItem(itemId, startDate2, endDate2)
      ).rejects.toThrow('Item is not available for the selected dates');
    });

    test('should throw error when trying to reserve a non-existent item', async () => {
      // Arrange
      const itemId = 'non_existent_room';
      const startDate = new Date('2023-08-01');
      const endDate = new Date('2023-08-05');

      // Act & Assert
      await expect(
        inventoryService.reserveItem(itemId, startDate, endDate)
      ).rejects.toThrow('Item is not available for the selected dates');
    });
  });

  describe('releaseItem', () => {
    test('should successfully release a reserved item', async () => {
      // Arrange
      const itemId = 'hotel_room_102';
      const startDate = new Date('2023-09-01');
      const endDate = new Date('2023-09-05');
      
      // First reserve the item
      await inventoryService.reserveItem(itemId, startDate, endDate);
      
      // Act
      const result = await inventoryService.releaseItem(itemId, startDate, endDate);

      // Assert
      expect(result).toBe(true);
      
      // Verify the reservation was removed
      // @ts-ignore - Accessing private property for testing
      const reservations = inventoryService.reservations.get(itemId);
      expect(reservations).toBeDefined();
      expect(reservations?.some(r => 
        r.startDate.getTime() === startDate.getTime() && 
        r.endDate.getTime() === endDate.getTime()
      )).toBe(false);
    });

    test('should throw error when trying to release a non-existent reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_103';
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-05');
      
      // Act & Assert
      await expect(
        inventoryService.releaseItem(itemId, startDate, endDate)
      ).rejects.toThrow('Reservation not found');
    });

    test('should throw error when trying to release with wrong dates', async () => {
      // Arrange
      const itemId = 'hotel_room_103';
      const startDate = new Date('2023-11-01');
      const endDate = new Date('2023-11-05');
      
      // First reserve the item
      await inventoryService.reserveItem(itemId, startDate, endDate);
      
      // Different dates for release
      const wrongStartDate = new Date('2023-11-02');
      const wrongEndDate = new Date('2023-11-06');
      
      // Act & Assert
      await expect(
        inventoryService.releaseItem(itemId, wrongStartDate, wrongEndDate)
      ).rejects.toThrow('Reservation not found');
    });
  });

  // Testing the private datesOverlap method indirectly through checkAvailability
  describe('datesOverlap (indirectly)', () => {
    test('should detect overlapping dates correctly', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      
      // First reserve the item
      const existingStartDate = new Date('2023-12-10');
      const existingEndDate = new Date('2023-12-20');
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Test various overlapping scenarios
      const testCases = [
        // Case 1: New reservation starts before and ends during existing
        { start: new Date('2023-12-05'), end: new Date('2023-12-15'), shouldOverlap: true },
        // Case 2: New reservation starts during and ends after existing
        { start: new Date('2023-12-15'), end: new Date('2023-12-25'), shouldOverlap: true },
        // Case 3: New reservation completely contains existing
        { start: new Date('2023-12-05'), end: new Date('2023-12-25'), shouldOverlap: true },
        // Case 4: New reservation completely within existing
        { start: new Date('2023-12-12'), end: new Date('2023-12-18'), shouldOverlap: true },
        // Case 5: New reservation ends exactly when existing starts
        { start: new Date('2023-12-05'), end: new Date('2023-12-10'), shouldOverlap: false },
        // Case 6: New reservation starts exactly when existing ends
        { start: new Date('2023-12-20'), end: new Date('2023-12-25'), shouldOverlap: false },
        // Case 7: New reservation completely before existing
        { start: new Date('2023-12-01'), end: new Date('2023-12-05'), shouldOverlap: false },
        // Case 8: New reservation completely after existing
        { start: new Date('2023-12-25'), end: new Date('2023-12-30'), shouldOverlap: false }
      ];
      
      // Act & Assert
      for (const testCase of testCases) {
        const isAvailable = await inventoryService.checkAvailability(
          itemId, testCase.start, testCase.end
        );
        expect(isAvailable).toBe(!testCase.shouldOverlap);
      }
    });
  });
});
