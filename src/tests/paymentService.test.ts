import { PaymentService } from '../services/paymentService';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  describe('processPayment', () => {
    test('should process payment successfully with valid inputs', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 100;
      const paymentMethod = 'credit_card';

      // Act
      const paymentId = await paymentService.processPayment(userId, amount, paymentMethod);

      // Assert
      expect(paymentId).toBeDefined();
      expect(paymentId).toMatch(/^payment_\d+_\d+$/);
    });

    test('should throw error when amount is zero', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 0;
      const paymentMethod = 'credit_card';

      // Act & Assert
      await expect(
        paymentService.processPayment(userId, amount, paymentMethod)
      ).rejects.toThrow('Payment amount must be greater than zero');
    });

    test('should throw error when amount is negative', async () => {
      // Arrange
      const userId = 'user123';
      const amount = -50;
      const paymentMethod = 'credit_card';

      // Act & Assert
      await expect(
        paymentService.processPayment(userId, amount, paymentMethod)
      ).rejects.toThrow('Payment amount must be greater than zero');
    });

    test('should throw error when payment method is invalid', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 100;
      const paymentMethod = 'invalid_method';

      // Act & Assert
      await expect(
        paymentService.processPayment(userId, amount, paymentMethod)
      ).rejects.toThrow('Invalid payment method');
    });

    test('should accept all valid payment methods', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 100;
      const validMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];

      // Act & Assert
      for (const method of validMethods) {
        const paymentId = await paymentService.processPayment(userId, amount, method);
        expect(paymentId).toBeDefined();
        expect(paymentId).toMatch(/^payment_\d+_\d+$/);
      }
    });

    test('should accept case-insensitive payment methods', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 100;
      const paymentMethod = 'CREDIT_CARD';

      // Act
      const paymentId = await paymentService.processPayment(userId, amount, paymentMethod);

      // Assert
      expect(paymentId).toBeDefined();
      expect(paymentId).toMatch(/^payment_\d+_\d+$/);
    });
  });

  describe('refundPayment', () => {
    test('should refund payment successfully with valid payment ID', async () => {
      // Arrange
      const paymentId = 'payment_12345_678';

      // Act
      const result = await paymentService.refundPayment(paymentId);

      // Assert
      expect(result).toBe(true);
    });

    test('should throw error when payment ID is invalid', async () => {
      // Arrange
      const invalidPaymentId = 'invalid_12345';

      // Act & Assert
      await expect(
        paymentService.refundPayment(invalidPaymentId)
      ).rejects.toThrow('Invalid payment ID');
    });

    test('should throw error when payment ID is empty', async () => {
      // Arrange
      const emptyPaymentId = '';

      // Act & Assert
      await expect(
        paymentService.refundPayment(emptyPaymentId)
      ).rejects.toThrow('Invalid payment ID');
    });
  });

  // Testing the private method through its public methods
  describe('validatePaymentMethod (indirectly)', () => {
    test('should accept all valid payment methods', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 100;
      const validMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];

      // Act & Assert
      for (const method of validMethods) {
        const paymentId = await paymentService.processPayment(userId, amount, method);
        expect(paymentId).toBeDefined();
      }
    });

    test('should reject invalid payment methods', async () => {
      // Arrange
      const userId = 'user123';
      const amount = 100;
      const invalidMethods = ['bitcoin', 'check', 'cash', 'wire_transfer'];

      // Act & Assert
      for (const method of invalidMethods) {
        await expect(
          paymentService.processPayment(userId, amount, method)
        ).rejects.toThrow('Invalid payment method');
      }
    });
  });
});
