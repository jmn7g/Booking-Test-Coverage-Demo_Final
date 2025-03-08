export class InventoryService {
  private inventory: Map<string, boolean> = new Map();
  private reservations: Map<string, Array<{startDate: Date, endDate: Date}>> = new Map();

  constructor() {
    // Initialize with some items
    this.inventory.set('hotel_room_101', true);
    this.inventory.set('hotel_room_102', true);
    this.inventory.set('hotel_room_103', true);
    this.reservations.set('hotel_room_101', []);
    this.reservations.set('hotel_room_102', []);
    this.reservations.set('hotel_room_103', []);
  }

  async checkAvailability(itemId: string, startDate: Date, endDate: Date): Promise<boolean> {
    // Check if item exists
    if (!this.inventory.has(itemId)) {
      return false;
    }

    // Check if item is active
    if (!this.inventory.get(itemId)) {
      return false;
    }

    // Check existing reservations
    const itemReservations = this.reservations.get(itemId) || [];
    const hasConflict = itemReservations.some(reservation => {
      return this.datesOverlap(startDate, endDate, reservation.startDate, reservation.endDate);
    });

    return !hasConflict;
  }

  async reserveItem(itemId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const isAvailable = await this.checkAvailability(itemId, startDate, endDate);
    if (!isAvailable) {
      throw new Error('Item is not available for the selected dates');
    }

    // Add reservation
    const itemReservations = this.reservations.get(itemId) || [];
    itemReservations.push({ startDate, endDate });
    this.reservations.set(itemId, itemReservations);

    return true;
  }

  async releaseItem(itemId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const itemReservations = this.reservations.get(itemId) || [];
    
    // Find and remove matching reservation
    const index = itemReservations.findIndex(reservation => {
      return reservation.startDate.getTime() === startDate.getTime() &&
        reservation.endDate.getTime() === endDate.getTime();
    });

    if (index === -1) {
      throw new Error('Reservation not found');
    }

    itemReservations.splice(index, 1);
    this.reservations.set(itemId, itemReservations);

    return true;
  }

  private datesOverlap(
    start1: Date, 
    end1: Date, 
    start2: Date, 
    end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1;
  }
}
"Add inventory management service"
