import { Invoice, Business } from './db';

export const pdf = {
  generateInvoicePdf: async (invoice: Invoice, business: Business): Promise<Uint8Array> => {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();

    // Add a blank page (A4 dimensions: 595.275 x 841.890 points)
    const page = pdfDoc.addPage([595.275, 841.890]);
    const { width, height } = page.getSize();

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color definitions matching design system
    const primaryColor = rgb(37/255, 99/255, 235/255); // #2563EB (Primary)
    const secondaryColor = rgb(14/255, 165/255, 233/255); // #0EA5E9
    const accentColor = rgb(20/255, 184/255, 166/255); // #14B8A6
    const darkTextColor = rgb(17/255, 24/255, 39/255); // #111827
    const mutedTextColor = rgb(100/255, 116/255, 139/255); // #64748B
    const bgRowColor = rgb(248/255, 250/255, 252/255); // Alternate row bg #F8FAFC
    const gridLineColor = rgb(226/255, 232/255, 240/255); // Grid #E2E8F0

    // Drawing variables
    let yPos = height - 50;

    // --- 1. Top Decorative Bar ---
    page.drawRectangle({
      x: 0,
      y: yPos - 10,
      width: width,
      height: 15,
      color: primaryColor,
    });
    yPos -= 35;

    // --- 2. Brand Identity Header ---
    page.drawText('BillFlow', {
      x: 40,
      y: yPos,
      size: 26,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText('ERP SYSTEM', {
      x: 145,
      y: yPos + 3,
      size: 10,
      font: helveticaBold,
      color: secondaryColor,
    });

    // Invoice Title (Right aligned)
    page.drawText('TAX INVOICE', {
      x: width - 180,
      y: yPos,
      size: 20,
      font: helveticaBold,
      color: darkTextColor,
    });
    yPos -= 25;

    // --- 3. Business Details (Seller) vs Invoice Info ---
    // Left column: Seller
    page.drawText(business.name.toUpperCase(), {
      x: 40,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: darkTextColor,
    });
    // Right column: Invoice Metadata
    page.drawText(`Invoice Number:  ${invoice.invoice_number}`, {
      x: width - 220,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: darkTextColor,
    });
    
    yPos -= 15;
    
    if (business.address) {
      page.drawText(business.address.substring(0, 50), {
        x: 40,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: mutedTextColor,
      });
    }
    page.drawText(`Date:  ${new Date(invoice.invoice_date).toLocaleDateString()}`, {
      x: width - 220,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: darkTextColor,
    });

    yPos -= 12;

    if (business.address && business.address.length > 50) {
      page.drawText(business.address.substring(50, 100), {
        x: 40,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: mutedTextColor,
      });
    }
    page.drawText(`Time:  ${new Date(invoice.invoice_date).toLocaleTimeString()}`, {
      x: width - 220,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: mutedTextColor,
    });

    yPos -= 12;

    page.drawText(`Phone: ${business.phone}`, {
      x: 40,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: mutedTextColor,
    });
    if (business.gstin) {
      page.drawText(`GSTIN: ${business.gstin}`, {
        x: 40,
        y: yPos - 12,
        size: 9,
        font: helveticaBold,
        color: primaryColor,
      });
    }

    yPos -= 40;

    // --- 4. Customer Details (Bill To) ---
    page.drawRectangle({
      x: 40,
      y: yPos - 2,
      width: width - 80,
      height: 18,
      color: bgRowColor,
    });
    page.drawText('BILL TO (CUSTOMER)', {
      x: 45,
      y: yPos + 3,
      size: 9,
      font: helveticaBold,
      color: darkTextColor,
    });
    
    yPos -= 18;

    if (invoice.customer_name) {
      page.drawText(`Name:    ${invoice.customer_name}`, {
        x: 45,
        y: yPos,
        size: 10,
        font: helveticaBold,
        color: darkTextColor,
      });
      yPos -= 14;
      page.drawText(`Phone:   +91 ${invoice.customer_phone || 'N/A'}`, {
        x: 45,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });
      yPos -= 14;
      if (invoice.customer_phone) {
        // Find customer details from DB locally to get address and GSTIN
        try {
          const customers = JSON.parse(localStorage.getItem('bf_customers') || '[]');
          const cData = customers.find((c: any) => c.phone === invoice.customer_phone);
          if (cData) {
            if (cData.address) {
              page.drawText(`Address: ${cData.address}`, {
                x: 45,
                y: yPos,
                size: 9,
                font: helveticaFont,
                color: mutedTextColor,
              });
              yPos -= 14;
            }
            if (cData.gstin) {
              page.drawText(`GSTIN:   ${cData.gstin}`, {
                x: 45,
                y: yPos,
                size: 9,
                font: helveticaBold,
                color: primaryColor,
              });
              yPos -= 14;
            }
          }
        } catch {}
      }
    } else {
      page.drawText('Walk-in Customer / Cash Sale', {
        x: 45,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: mutedTextColor,
      });
      yPos -= 14;
    }

    yPos -= 20;

    // --- 5. Table of Products / Items ---
    const tableHeaderY = yPos;
    const colX = {
      no: 40,
      item: 70,
      qty: 290,
      price: 350,
      gst: 420,
      total: 490,
    };

    // Draw header background
    page.drawRectangle({
      x: colX.no,
      y: tableHeaderY - 5,
      width: width - 80,
      height: 22,
      color: primaryColor,
    });

    // Draw table header columns
    const headers = [
      { text: 'S.No', x: colX.no + 5 },
      { text: 'Item Description', x: colX.item },
      { text: 'Qty', x: colX.qty, alignRight: true },
      { text: 'Rate (INR)', x: colX.price, alignRight: true },
      { text: 'GST %', x: colX.gst, alignRight: true },
      { text: 'Total (INR)', x: colX.total, alignRight: true },
    ];

    headers.forEach(h => {
      page.drawText(h.text, {
        x: h.x,
        y: tableHeaderY + 2,
        size: 9,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });
    });

    yPos -= 22;

    // Table rows
    invoice.items.forEach((item, index) => {
      // Row height
      const rowHeight = 22;
      const isEven = index % 2 === 0;

      // Draw alternate background
      if (isEven) {
        page.drawRectangle({
          x: colX.no,
          y: yPos + 1,
          width: width - 80,
          height: rowHeight,
          color: bgRowColor,
        });
      }

      // Draw borders
      page.drawLine({
        start: { x: colX.no, y: yPos + 1 },
        end: { x: width - 40, y: yPos + 1 },
        thickness: 0.5,
        color: gridLineColor,
      });

      // Populate text
      page.drawText((index + 1).toString(), {
        x: colX.no + 8,
        y: yPos + 7,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });

      // Handle wrapping of item name if too long
      const itemName = item.product_name.substring(0, 36);
      page.drawText(itemName, {
        x: colX.item,
        y: yPos + 7,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });

      page.drawText(item.qty.toString(), {
        x: colX.qty + 5,
        y: yPos + 7,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });

      page.drawText(item.unit_price.toFixed(2), {
        x: colX.price + 5,
        y: yPos + 7,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });

      page.drawText(`${item.gst_rate}%`, {
        x: colX.gst + 5,
        y: yPos + 7,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });

      page.drawText(item.total_amount.toFixed(2), {
        x: colX.total + 5,
        y: yPos + 7,
        size: 9,
        font: helveticaBold,
        color: darkTextColor,
      });

      yPos -= rowHeight;
    });

    // Close the table box with a line
    page.drawLine({
      start: { x: colX.no, y: yPos + 1 },
      end: { x: width - 40, y: yPos + 1 },
      thickness: 1,
      color: primaryColor,
    });

    yPos -= 25;

    // --- 6. Invoice Totals and Payment Summary ---
    const totalsX = width - 200;

    // Subtotal
    page.drawText('Subtotal:', {
      x: totalsX,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: mutedTextColor,
    });
    page.drawText(`INR ${invoice.subtotal.toFixed(2)}`, {
      x: width - 110,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: darkTextColor,
    });

    yPos -= 14;

    // Discount
    if (invoice.discount_amount > 0) {
      page.drawText('Discount:', {
        x: totalsX,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: mutedTextColor,
      });
      page.drawText(`-INR ${invoice.discount_amount.toFixed(2)}`, {
        x: width - 110,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: rgb(220/255, 38/255, 38/255), // Red
      });
      yPos -= 14;
    }

    // GST Tax
    if (invoice.gst_amount > 0) {
      page.drawText('CGST + SGST Tax:', {
        x: totalsX,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: mutedTextColor,
      });
      page.drawText(`INR ${invoice.gst_amount.toFixed(2)}`, {
        x: width - 110,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });
      yPos -= 14;
    }

    // Draw separator for Net Total
    page.drawLine({
      start: { x: totalsX, y: yPos + 5 },
      end: { x: width - 40, y: yPos + 5 },
      thickness: 0.5,
      color: mutedTextColor,
    });

    // Net Total (Payable)
    page.drawText('NET PAYABLE:', {
      x: totalsX,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(`INR ${invoice.total_amount.toFixed(2)}`, {
      x: width - 115,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: primaryColor,
    });

    // --- Payment Methods Logged ---
    const paymentY = yPos + 35;
    page.drawText('PAYMENT BREAKDOWN', {
      x: 40,
      y: paymentY,
      size: 9,
      font: helveticaBold,
      color: darkTextColor,
    });
    page.drawLine({
      start: { x: 40, y: paymentY - 3 },
      end: { x: 200, y: paymentY - 3 },
      thickness: 0.5,
      color: mutedTextColor,
    });

    invoice.payments.forEach((pay, pIdx) => {
      const pyOffset = paymentY - 15 - (pIdx * 14);
      page.drawText(`- ${pay.payment_method.toUpperCase()}:`, {
        x: 40,
        y: pyOffset,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });
      page.drawText(`INR ${pay.amount.toFixed(2)}`, {
        x: 120,
        y: pyOffset,
        size: 9,
        font: helveticaFont,
        color: darkTextColor,
      });
    });

    // --- 7. Bottom Branding / Terms Footer ---
    const footerY = 50;
    page.drawLine({
      start: { x: 40, y: footerY + 20 },
      end: { x: width - 40, y: footerY + 20 },
      thickness: 0.5,
      color: gridLineColor,
    });

    page.drawText('Declaration / Terms & Conditions:', {
      x: 40,
      y: footerY + 8,
      size: 8,
      font: helveticaBold,
      color: mutedTextColor,
    });
    page.drawText('Goods once sold will not be taken back or exchanged. Interest @ 18% p.a. will be charged for delayed payments.', {
      x: 40,
      y: footerY - 2,
      size: 7,
      font: helveticaFont,
      color: mutedTextColor,
    });

    page.drawText('THANK YOU FOR YOUR BUSINESS!', {
      x: width / 2 - 80,
      y: footerY - 20,
      size: 10,
      font: helveticaBold,
      color: primaryColor,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    return await pdfDoc.save();
  },

  // Generates and triggers download of the invoice PDF directly in the browser
  downloadInvoicePdf: async (invoice: Invoice, business: Business): Promise<void> => {
    try {
      const pdfBytes = await pdf.generateInvoicePdf(invoice, business);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Invoice_${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Make sure pdf-lib is fully installed.');
    }
  }
};
