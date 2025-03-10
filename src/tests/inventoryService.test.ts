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
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-05');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(true);
    });

    test('should return false for non-existent item', async () => {
      // Arrange
      const itemId = 'non_existent_room';
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-05');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return false when dates overlap with existing reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate1 = new Date('2023-10-01');
      const endDate1 = new Date('2023-10-05');
      
      // Reserve the room first
      await inventoryService.reserveItem(itemId, startDate1, endDate1);
      
      // Try to check availability for overlapping dates
      const startDate2 = new Date('2023-10-03');
      const endDate2 = new Date('2023-10-07');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate2, endDate2);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return true when dates do not overlap with existing reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate1 = new Date('2023-10-01');
      const endDate1 = new Date('2023-10-05');
      
      // Reserve the room first
      await inventoryService.reserveItem(itemId, startDate1, endDate1);
      
      // Try to check availability for non-overlapping dates
      const startDate2 = new Date('2023-10-06');
      const endDate2 = new Date('2023-10-10');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate2, endDate2);

      // Assert
      expect(isAvailable).toBe(true);
    });

    test('should correctly identify various overlap scenarios', async () => {
      // Arrange
      const itemId = 'hotel_room_102';
      const existingStart = new Date('2023-10-10');
      const existingEnd = new Date('2023-10-15');
      
      // Reserve the room first
      await inventoryService.reserveItem(itemId, existingStart, existingEnd);
      
      // Test cases for different overlap scenarios
      const testCases = [
        // Completely before
        { start: new Date('2023-10-05'), end: new Date('2023-10-09'), expected: true },
        // Starts before, ends during
        { start: new Date('2023-10-08'), end: new Date('2023-10-12'), expected: false },
        // Completely contained
        { start: new Date('2023-10-11'), end: new Date('2023-10-14'), expected: false },
        // Starts during, ends after
        { start: new Date('2023-10-14'), end: new Date('2023-10-18'), expected: false },
        // Completely after
        { start: new Date('2023-10-16'), end: new Date('2023-10-20'), expected: true },
        // Exactly the same dates
        { start: new Date('2023-10-10'), end: new Date('2023-10-15'), expected: false },
      ];

      // Act & Assert
      for (const testCase of testCases) {
        const isAvailable = await inventoryService.checkAvailability(
          itemId, testCase.start, testCase.end
        );
        expect(isAvailable).toBe(testCase.expected);
      }
    });
  });

  describe('reserveItem', () => {
    test('should successfully reserve an available item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-11-01');
      const endDate = new Date('2023-11-05');

      // Act
      const result = await inventoryService.reserveItem(itemId, startDate, endDate);

      // Assert
      expect(result).toBe(true);
      
      // Verify the item is no longer available for those dates
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);
      expect(isAvailable).toBe(false);
    });

    test('should throw error when trying to reserve unavailable item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-05');
      
      // Reserve the room first
      await inventoryService.reserveItem(itemId, startDate, endDate);

      // Act & Assert
      await expect(
        inventoryService.reserveItem(itemId, startDate, endDate)
      ).rejects.toThrow('Item is not available for the selected dates');
    });

    test('should throw error when trying to reserve non-existent item', async () => {
      // Arrange
      const itemId = 'non_existent_room';
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-05');

      // Act & Assert
      await expect(
        inventoryService.reserveItem(itemId, startDate, endDate)
      ).rejects.toThrow('Item is not available for the selected dates');
    });
  });

  describe('releaseItem', () => {
    test('should successfully release a reserved item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      
      // Reserve the room first
      await inventoryService.reserveItem(itemId, startDate, endDate);
      
      // Act
      const result = await inventoryService.releaseItem(itemId, startDate, endDate);

      // Assert
      expect(result).toBe(true);
      
      // Verify the item is available again
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate, endDate);
      expect(isAvailable).toBe(true);
    });

    test('should throw error when trying to release a non-existent reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-05');

      // Act & Assert
      await expect(
        inventoryService.releaseItem(itemId, startDate, endDate)
      ).rejects.toThrow('Reservation not found');
    });
  });

  describe('datesOverlap', () => {
    test('should correctly identify overlapping dates', async () => {
      // This is testing a private method indirectly through the public methods
      const itemId = 'hotel_room_103';
      const startDate1 = new Date('2024-03-01');
      const endDate1 = new Date('2024-03-10');
      
      // Create a reservation
      await inventoryService.reserveItem(itemId, startDate1, endDate1);
      
      // Test overlapping dates
      const startDate2 = new Date('2024-03-05');
      const endDate2 = new Date('2024-03-15');
      
      // Check availability should return false if dates overlap
      const isAvailable = await inventoryService.checkAvailability(itemId, startDate2, endDate2);
      expect(isAvailable).toBe(false);
    });
  });
});
