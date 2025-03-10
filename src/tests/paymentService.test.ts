import { PaymentService } from '../services/paymentService';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  test('should process payment successfully', async () => {
    // Act
    const paymentId = await paymentService.processPayment(
      'user123',
      100,
      'credit_card'
    );

    // Assert
    expect(paymentId).toBeDefined();
    expect(paymentId.startsWith('payment_')).toBe(true);
  });

  test('should throw error for invalid payment amount', async () => {
    // Act & Assert
    await expect(paymentService.processPayment(
      'user123',
      0,
      'credit_card'
    )).rejects.toThrow('Payment amount must be greater than zero');

    await expect(paymentService.processPayment(
      'user123',
      -10,
      'credit_card'
    )).rejects.toThrow('Payment amount must be greater than zero');
  });

  test('should throw error for invalid payment method', async () => {
    // Act & Assert
    await expect(paymentService.processPayment(
      'user123',
      100,
      'invalid_method'
    )).rejects.toThrow('Invalid payment method');
  });

  test('should process refund successfully', async () => {
    // Arrange
    const paymentId = await paymentService.processPayment(
      'user123',
      100,
      'credit_card'
    );

    // Act
    const result = await paymentService.refundPayment(paymentId);

    // Assert
    expect(result).toBe(true);
  });

  test('should throw error for invalid payment ID during refund', async () => {
    // Act & Assert
    await expect(paymentService.refundPayment(
      'invalid_payment_id'
    )).rejects.toThrow('Invalid payment ID');
  });

  test('should validate payment methods correctly', async () => {
    // Arrange - Create a payment with each valid method
    const validMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];

    // Act & Assert
    for (const method of validMethods) {
      const paymentId = await paymentService.processPayment('user123', 100, method);
      expect(paymentId).toBeDefined();
      expect(paymentId.startsWith('payment_')).toBe(true);
    }
  });
});
