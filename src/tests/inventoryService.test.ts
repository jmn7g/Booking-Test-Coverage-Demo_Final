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
      const nonExistentItemId = 'hotel_room_999';
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-05');

      // Act
      const isAvailable = await inventoryService.checkAvailability(nonExistentItemId, startDate, endDate);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return false when dates overlap with existing reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const existingStartDate = new Date('2023-06-10');
      const existingEndDate = new Date('2023-06-15');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Check availability for overlapping dates
      const overlapStartDate = new Date('2023-06-12');
      const overlapEndDate = new Date('2023-06-18');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, overlapStartDate, overlapEndDate);

      // Assert
      expect(isAvailable).toBe(false);
    });

    test('should return true when dates do not overlap with existing reservation', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const existingStartDate = new Date('2023-07-10');
      const existingEndDate = new Date('2023-07-15');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Check availability for non-overlapping dates
      const nonOverlapStartDate = new Date('2023-07-16');
      const nonOverlapEndDate = new Date('2023-07-20');

      // Act
      const isAvailable = await inventoryService.checkAvailability(itemId, nonOverlapStartDate, nonOverlapEndDate);

      // Assert
      expect(isAvailable).toBe(true);
    });

    test('should correctly identify various overlap scenarios', async () => {
      // Arrange
      const itemId = 'hotel_room_102';
      const existingStartDate = new Date('2023-08-10');
      const existingEndDate = new Date('2023-08-15');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Test cases for different overlap scenarios
      const testCases = [
        // Completely before
        { 
          start: new Date('2023-08-01'), 
          end: new Date('2023-08-09'), 
          expected: true 
        },
        // End overlaps with start
        { 
          start: new Date('2023-08-05'), 
          end: new Date('2023-08-12'), 
          expected: false 
        },
        // Completely contained
        { 
          start: new Date('2023-08-11'), 
          end: new Date('2023-08-14'), 
          expected: false 
        },
        // Start overlaps with end
        { 
          start: new Date('2023-08-14'), 
          end: new Date('2023-08-20'), 
          expected: false 
        },
        // Completely after
        { 
          start: new Date('2023-08-16'), 
          end: new Date('2023-08-20'), 
          expected: true 
        },
        // Exactly the same dates
        { 
          start: new Date('2023-08-10'), 
          end: new Date('2023-08-15'), 
          expected: false 
        }
      ];

      // Act & Assert
      for (const testCase of testCases) {
        const isAvailable = await inventoryService.checkAvailability(
          itemId, 
          testCase.start, 
          testCase.end
        );
        expect(isAvailable).toBe(testCase.expected);
      }
    });
  });

  describe('reserveItem', () => {
    test('should successfully reserve an available item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-09-01');
      const endDate = new Date('2023-09-05');

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
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-05');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, startDate, endDate);

      // Act & Assert
      await expect(
        inventoryService.reserveItem(itemId, startDate, endDate)
      ).rejects.toThrow('Item is not available for the selected dates');
    });

    test('should throw error when trying to reserve non-existent item', async () => {
      // Arrange
      const nonExistentItemId = 'hotel_room_999';
      const startDate = new Date('2023-10-01');
      const endDate = new Date('2023-10-05');

      // Act & Assert
      await expect(
        inventoryService.reserveItem(nonExistentItemId, startDate, endDate)
      ).rejects.toThrow('Item is not available for the selected dates');
    });
  });

  describe('releaseItem', () => {
    test('should successfully release a reserved item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-11-01');
      const endDate = new Date('2023-11-05');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, startDate, endDate);
      
      // Verify it's reserved
      const isAvailableBeforeRelease = await inventoryService.checkAvailability(itemId, startDate, endDate);
      expect(isAvailableBeforeRelease).toBe(false);

      // Act
      const result = await inventoryService.releaseItem(itemId, startDate, endDate);

      // Assert
      expect(result).toBe(true);
      
      // Verify the item is available again
      const isAvailableAfterRelease = await inventoryService.checkAvailability(itemId, startDate, endDate);
      expect(isAvailableAfterRelease).toBe(true);
    });

    test('should throw error when trying to release a non-reserved item', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-05');

      // Act & Assert
      await expect(
        inventoryService.releaseItem(itemId, startDate, endDate)
      ).rejects.toThrow('Reservation not found');
    });

    test('should throw error when trying to release with incorrect dates', async () => {
      // Arrange
      const itemId = 'hotel_room_101';
      const reserveStartDate = new Date('2024-01-01');
      const reserveEndDate = new Date('2024-01-05');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, reserveStartDate, reserveEndDate);
      
      // Try to release with different dates
      const releaseStartDate = new Date('2024-01-02');
      const releaseEndDate = new Date('2024-01-05');

      // Act & Assert
      await expect(
        inventoryService.releaseItem(itemId, releaseStartDate, releaseEndDate)
      ).rejects.toThrow('Reservation not found');
    });
  });

  describe('datesOverlap', () => {
    // Testing private method through public methods
    test('should correctly identify various date overlap scenarios', async () => {
      // Arrange
      const itemId = 'hotel_room_103';
      const existingStartDate = new Date('2024-02-10');
      const existingEndDate = new Date('2024-02-15');
      
      // Reserve the item first
      await inventoryService.reserveItem(itemId, existingStartDate, existingEndDate);
      
      // Test cases for different overlap scenarios
      const testCases = [
        // Completely before
        { 
          start: new Date('2024-02-01'), 
          end: new Date('2024-02-09'), 
          expected: true // Available (no overlap)
        },
        // End overlaps with start
        { 
          start: new Date('2024-02-05'), 
          end: new Date('2024-02-12'), 
          expected: false // Not available (overlap)
        },
        // Start overlaps with end
        { 
          start: new Date('2024-02-14'), 
          end: new Date('2024-02-20'), 
          expected: false // Not available (overlap)
        },
        // Completely after
        { 
          start: new Date('2024-02-16'), 
          end: new Date('2024-02-20'), 
          expected: true // Available (no overlap)
        }
      ];

      // Act & Assert
      for (const testCase of testCases) {
        const isAvailable = await inventoryService.checkAvailability(
          itemId, 
          testCase.start, 
          testCase.end
        );
        expect(isAvailable).toBe(testCase.expected);
      }
    });
  });
});
