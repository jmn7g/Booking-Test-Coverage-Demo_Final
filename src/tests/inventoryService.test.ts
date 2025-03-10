import { InventoryService } from '../services/inventoryService';

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
  });

  test('should check availability for valid item and dates', async () => {
    // Act
    const isAvailable = await inventoryService.checkAvailability(
      'hotel_room_101',
      new Date('2023-11-01'),
      new Date('2023-11-05')
    );

    // Assert
    expect(isAvailable).toBe(true);
  });

  test('should return false for non-existent item', async () => {
    // Act
    const isAvailable = await inventoryService.checkAvailability(
      'non_existent_room',
      new Date('2023-11-01'),
      new Date('2023-11-05')
    );

    // Assert
    expect(isAvailable).toBe(false);
  });

  test('should detect date conflicts correctly', async () => {
    // Arrange
    const itemId = 'hotel_room_102';
    const startDate1 = new Date('2023-12-01');
    const endDate1 = new Date('2023-12-05');

    // Reserve the item first
    await inventoryService.reserveItem(itemId, startDate1, endDate1);

    // Test overlapping scenarios
    const testCases = [
      // Completely before - should be available
      {
        start: new Date('2023-11-25'),
        end: new Date('2023-11-30'),
        expected: true
      },
      // Completely after - should be available
      {
        start: new Date('2023-12-06'),
        end: new Date('2023-12-10'),
        expected: true
      },
      // Overlapping start - should not be available
      {
        start: new Date('2023-11-28'),
        end: new Date('2023-12-02'),
        expected: false
      },
      // Overlapping end - should not be available
      {
        start: new Date('2023-12-03'),
        end: new Date('2023-12-08'),
        expected: false
      },
      // Completely inside - should not be available
      {
        start: new Date('2023-12-02'),
        end: new Date('2023-12-04'),
        expected: false
      },
      // Completely surrounding - should not be available
      {
        start: new Date('2023-11-28'),
        end: new Date('2023-12-08'),
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

  test('should reserve item successfully', async () => {
    // Act
    const result = await inventoryService.reserveItem(
      'hotel_room_103',
      new Date('2024-01-01'),
      new Date('2024-01-05')
    );

    // Assert
    expect(result).toBe(true);

    // Verify the item is no longer available for those dates
    const isAvailable = await inventoryService.checkAvailability(
      'hotel_room_103',
      new Date('2024-01-01'),
      new Date('2024-01-05')
    );
    expect(isAvailable).toBe(false);
  });

  test('should throw error when reserving unavailable item', async () => {
    // Arrange
    const itemId = 'hotel_room_101';
    const startDate = new Date('2024-02-01');
    const endDate = new Date('2024-02-05');

    // Reserve the item first
    await inventoryService.reserveItem(itemId, startDate, endDate);

    // Act & Assert
    await expect(inventoryService.reserveItem(
      itemId,
      startDate,
      endDate
    )).rejects.toThrow('Item is not available for the selected dates');
  });

  test('should release item successfully', async () => {
    // Arrange
    const itemId = 'hotel_room_101';
    const startDate = new Date('2024-03-01');
    const endDate = new Date('2024-03-05');

    // Reserve the item first
    await inventoryService.reserveItem(itemId, startDate, endDate);

    // Act
    const result = await inventoryService.releaseItem(itemId, startDate, endDate);

    // Assert
    expect(result).toBe(true);

    // Verify the item is available again
    const isAvailable = await inventoryService.checkAvailability(
      itemId,
      startDate,
      endDate
    );
    expect(isAvailable).toBe(true);
  });

  test('should throw error when releasing non-existent reservation', async () => {
    // Act & Assert
    await expect(inventoryService.releaseItem(
      'hotel_room_101',
      new Date('2024-04-01'),
      new Date('2024-04-05')
    )).rejects.toThrow('Reservation not found');
  });
});
