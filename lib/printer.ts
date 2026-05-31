import { Invoice, Business } from './db';

// ESC/POS Commands
export const ESC_POS_COMMANDS = {
  INIT: '\x1b\x40',
  ALIGN_LEFT: '\x1b\x61\x00',
  ALIGN_CENTER: '\x1b\x61\x01',
  ALIGN_RIGHT: '\x1b\x61\x02',
  BOLD_ON: '\x1b\x45\x01',
  BOLD_OFF: '\x1b\x45\x00',
  DOUBLE_SIZE_ON: '\x1d\x21\x11', // Double width + double height
  DOUBLE_SIZE_OFF: '\x1d\x21\x00',
  UNDERLINE_ON: '\x1b\x2d\x01',
  UNDERLINE_OFF: '\x1b\x2d\x00',
  CUT: '\x1d\x56\x41\x03', // Feed paper and cut
  BELL: '\x07',
};

export const printer = {
  // Compiles raw ESC/POS byte sequence as a string (can be sent to Bluetooth/Network socket or serial port)
  compileEscPos: (invoice: Invoice, business: Business, paperSize: 58 | 80 = 80): string => {
    const width = paperSize === 58 ? 32 : 48; // Character width
    const separator = '-'.repeat(width);
    const doubleSeparator = '='.repeat(width);

    let output = '';

    // Init Printer
    output += ESC_POS_COMMANDS.INIT;
    
    // Header
    output += ESC_POS_COMMANDS.ALIGN_CENTER;
    output += ESC_POS_COMMANDS.BOLD_ON;
    output += ESC_POS_COMMANDS.DOUBLE_SIZE_ON;
    output += `${business.name.toUpperCase()}\n`;
    output += ESC_POS_COMMANDS.DOUBLE_SIZE_OFF;
    output += ESC_POS_COMMANDS.BOLD_OFF;

    if (business.address) {
      output += `${business.address}\n`;
    }
    output += `Phone: ${business.phone}\n`;
    if (business.gstin) {
      output += `GSTIN: ${business.gstin}\n`;
    }
    output += separator + '\n';

    // Invoice Meta
    output += ESC_POS_COMMANDS.ALIGN_LEFT;
    output += `Invoice #: ${invoice.invoice_number}\n`;
    output += `Date: ${new Date(invoice.invoice_date).toLocaleString()}\n`;
    if (invoice.customer_name) {
      output += `Customer: ${invoice.customer_name}\n`;
      output += `Phone: ${invoice.customer_phone || 'N/A'}\n`;
    }
    output += separator + '\n';

    // Items Header
    // Column widths: Name (flexible), Qty (6), Price (8), Total (10)
    output += ESC_POS_COMMANDS.BOLD_ON;
    if (width === 32) {
      output += 'Item             Qty  Price Total\n';
    } else {
      output += 'Item Description          Qty    Price     Total\n';
    }
    output += ESC_POS_COMMANDS.BOLD_OFF;
    output += separator + '\n';

    // Items List
    invoice.items.forEach(item => {
      let nameLine = item.product_name;
      const qtyStr = item.qty.toString();
      const priceStr = item.unit_price.toFixed(2);
      const totalStr = item.total_amount.toFixed(2);

      if (width === 32) {
        // 58mm layout
        // Truncate name to 12 chars
        const shortName = nameLine.substring(0, 12).padEnd(12);
        const qtyCol = qtyStr.padStart(5);
        const priceCol = priceStr.padStart(7);
        const totalCol = totalStr.padStart(8);
        output += `${shortName}${qtyCol}${priceCol}${totalCol}\n`;
      } else {
        // 80mm layout
        // Truncate name to 24 chars
        const shortName = nameLine.substring(0, 24).padEnd(24);
        const qtyCol = qtyStr.padStart(6);
        const priceCol = priceStr.padStart(8);
        const totalCol = totalStr.padStart(10);
        output += `${shortName}${qtyCol}${priceCol}${totalCol}\n`;
      }
    });
    output += separator + '\n';

    // Totals
    output += ESC_POS_COMMANDS.ALIGN_RIGHT;
    output += `Subtotal:  INR ${invoice.subtotal.toFixed(2)}\n`;
    if (invoice.discount_amount > 0) {
      output += `Discount: -INR ${invoice.discount_amount.toFixed(2)}\n`;
    }
    if (invoice.gst_amount > 0) {
      output += `CGST/SGST Tax:  INR ${invoice.gst_amount.toFixed(2)}\n`;
    }
    output += ESC_POS_COMMANDS.BOLD_ON;
    output += `NET TOTAL:  INR ${invoice.total_amount.toFixed(2)}\n`;
    output += ESC_POS_COMMANDS.BOLD_OFF;
    output += doubleSeparator + '\n';

    // Payments
    output += ESC_POS_COMMANDS.ALIGN_LEFT;
    output += 'Paid via:\n';
    invoice.payments.forEach(pay => {
      output += `  - ${pay.payment_method.toUpperCase()}: INR ${pay.amount.toFixed(2)}\n`;
    });
    output += separator + '\n';

    // Footer
    output += ESC_POS_COMMANDS.ALIGN_CENTER;
    output += ESC_POS_COMMANDS.BOLD_ON;
    output += 'Thank You! Visit Again.\n';
    output += ESC_POS_COMMANDS.BOLD_OFF;
    output += 'Powered by BillFlow ERP\n\n\n\n';

    // Cut Paper
    output += ESC_POS_COMMANDS.CUT;

    return output;
  },

  // Triggers native browser print dialog by opening a hidden iframe or new print window
  printViaBrowser: (invoice: Invoice, business: Business): void => {
    if (typeof window === 'undefined') return;

    // Create a temporary hidden print container
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups to print invoices.');
      return;
    }

    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td style="padding: 6px 0; font-family: monospace;">${item.product_name}</td>
        <td style="padding: 6px 0; text-align: center; font-family: monospace;">${item.qty}</td>
        <td style="padding: 6px 0; text-align: right; font-family: monospace;">₹${item.unit_price.toFixed(2)}</td>
        <td style="padding: 6px 0; text-align: right; font-family: monospace;">₹${item.total_amount.toFixed(2)}</td>
      </tr>
    `).join('');

    const paymentsHtml = invoice.payments.map(pay => `
      <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 13px;">
        <span>${pay.payment_method.toUpperCase()} PAYMENT:</span>
        <span>₹${pay.amount.toFixed(2)}</span>
      </div>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Invoice #${invoice.invoice_number}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              color: #111827;
              background-color: #fff;
              width: 80mm;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              margin-bottom: 12px;
            }
            .shop-name {
              font-size: 20px;
              font-weight: bold;
              margin: 0 0 4px 0;
              text-transform: uppercase;
            }
            .shop-details {
              font-size: 12px;
              color: #4B5563;
              margin: 2px 0;
            }
            .divider {
              border-top: 1px dashed #9CA3AF;
              margin: 8px 0;
            }
            .double-divider {
              border-top: 2px double #4B5563;
              margin: 8px 0;
            }
            .meta-info {
              font-size: 12px;
              margin-bottom: 8px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            th {
              font-size: 12px;
              font-weight: bold;
              border-bottom: 1px solid #E5E7EB;
              padding-bottom: 4px;
            }
            td {
              font-size: 12px;
            }
            .totals-panel {
              display: flex;
              flex-direction: column;
              gap: 4px;
              align-items: flex-end;
              font-size: 13px;
              margin-bottom: 8px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              width: 100%;
            }
            .grand-total {
              font-weight: bold;
              font-size: 15px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              margin-top: 16px;
              color: #4B5563;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="shop-name">${business.name}</h1>
            <p class="shop-details">${business.address || ''}</p>
            <p class="shop-details">Phone: ${business.phone}</p>
            ${business.gstin ? `<p class="shop-details">GSTIN: ${business.gstin}</p>` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="meta-info">
            <div class="meta-row">
              <span>Invoice No:</span>
              <strong>#${invoice.invoice_number}</strong>
            </div>
            <div class="meta-row">
              <span>Date:</span>
              <span>${new Date(invoice.invoice_date).toLocaleString()}</span>
            </div>
            ${invoice.customer_name ? `
              <div class="meta-row" style="margin-top: 4px;">
                <span>Customer:</span>
                <span>${invoice.customer_name}</span>
              </div>
              <div class="meta-row">
                <span>Phone:</span>
                <span>${invoice.customer_phone}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: center; width: 40px;">Qty</th>
                <th style="text-align: right; width: 60px;">Price</th>
                <th style="text-align: right; width: 70px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="totals-panel">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.discount_amount > 0 ? `
              <div class="totals-row">
                <span>Discount:</span>
                <span>-₹${invoice.discount_amount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${invoice.gst_amount > 0 ? `
              <div class="totals-row">
                <span>CGST/SGST Tax:</span>
                <span>₹${invoice.gst_amount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="double-divider" style="width: 100%;"></div>
            <div class="totals-row grand-total">
              <span>NET TOTAL:</span>
              <span>₹${invoice.total_amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">PAID VIA:</div>
            ${paymentsHtml}
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <strong>THANK YOU! VISIT AGAIN</strong>
            <div style="font-size: 10px; margin-top: 4px;">Powered by BillFlow ERP</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
