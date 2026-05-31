export interface RazorpayPaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export const razorpay = {
  // Dynamically load Razorpay standard script
  loadScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Launch checkout checkout popup
  openCheckout: async (options: Omit<RazorpayPaymentOptions, 'key'> & { key?: string }): Promise<void> => {
    const isLoaded = await razorpay.loadScript();
    
    // Check if key is available, otherwise fall back to Simulated Pay flow
    const rzpKey = options.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    
    if (!isLoaded || !rzpKey) {
      console.warn('Razorpay SDK failed to load or key is missing. Falling back to simulation mode.');
      
      // Simulate receipt delay and run handler callback
      return new Promise((resolve) => {
        const confirmPay = confirm(
          `[SIMULATION MODE] - Razorpay Checkout\n\n` +
          `Merchant: ${options.name}\n` +
          `Purpose: ${options.description}\n` +
          `Amount: ${options.currency} ${(options.amount / 100).toFixed(2)}\n\n` +
          `Click OK to simulate a SUCCESSFUL payment.`
        );

        if (confirmPay) {
          setTimeout(() => {
            options.handler({
              razorpay_payment_id: 'pay_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
              razorpay_order_id: options.order_id || 'order_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase()
            });
            resolve();
          }, 800);
        }
      });
    }

    // Launch Real Razorpay SDK Checkout
    const rzpInstance = new (window as any).Razorpay({
      ...options,
      key: rzpKey
    });
    rzpInstance.open();
  }
};
