import { Invoice } from './db';

export interface WhatsAppLog {
  id: string;
  invoice_id: string;
  phone: string;
  status: 'pending' | 'sent' | 'failed';
  timestamp: string;
  message: string;
}

export const whatsapp = {
  // Generates a pre-filled WhatsApp link to send manually via WhatsApp Web/App
  getShareLink: (invoice: Invoice, businessName: string): string => {
    const phoneNum = invoice.customer_phone ? invoice.customer_phone.replace(/\D/g, '') : '';
    // Format message
    const msg = `*${businessName}* - Invoice Receipt\n` +
      `---------------------------------\n` +
      `*Invoice No:* ${invoice.invoice_number}\n` +
      `*Date:* ${new Date(invoice.invoice_date).toLocaleDateString()}\n` +
      `*Total Amount:* ₹${invoice.total_amount.toFixed(2)}\n\n` +
      `*Items:*\n` +
      invoice.items.map(item => `- ${item.product_name} x ${item.qty}: ₹${item.total_amount.toFixed(2)}`).join('\n') +
      `\n\nThank you for shopping with us! View your digital invoice here: https://billflow.vercel.app/invoice/${invoice.id}`;

    // Add country code if missing (defaulting to India +91)
    const formattedPhone = phoneNum.length === 10 ? `91${phoneNum}` : phoneNum;
    return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msg)}`;
  },

  // Simulates cloud API delivery
  sendViaCloudAPI: async (invoice: Invoice, businessName: string): Promise<{ success: boolean; log: WhatsAppLog }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const phone = invoice.customer_phone || '';
        const success = phone.length >= 10;
        
        const log: WhatsAppLog = {
          id: 'wlog_' + Date.now(),
          invoice_id: invoice.id,
          phone,
          status: success ? 'sent' : 'failed',
          timestamp: new Date().toISOString(),
          message: success 
            ? `Successfully sent PDF invoice #${invoice.invoice_number} to +${phone} via WhatsApp Cloud API.`
            : `Failed to deliver. Invalid phone number +${phone}.`
        };

        // Cache log in localStorage for demo auditing
        if (typeof window !== 'undefined') {
          const logs = JSON.parse(localStorage.getItem('bf_whatsapp_logs') || '[]');
          logs.unshift(log);
          localStorage.setItem('bf_whatsapp_logs', JSON.stringify(logs));
        }

        resolve({ success, log });
      }, 1500); // 1.5s simulated delivery delay
    });
  },

  getLogs: (): WhatsAppLog[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('bf_whatsapp_logs') || '[]');
  }
};
