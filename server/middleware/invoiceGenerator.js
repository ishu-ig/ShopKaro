const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (orderData, filePath) => {
  return new Promise((resolve, reject) => {

    // 🔹 If file already exists, skip PDF generation
    if (fs.existsSync(filePath)) {
      console.log('✅ Invoice PDF already exists:', filePath);
      return resolve();
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ================= HEADER =================
    doc
      .fontSize(26)
      .fillColor('#333')
      .text('INVOICE', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .fillColor('#555')
      .text(`Invoice Number: ${orderData.invoiceNumber}`, { align: 'right' })
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
      .moveDown(2);

    // ================= BILLING & SHIPPING =================
    const billingX = 50;
    const shippingX = 300;
    let currentY = doc.y;

    // ===== Billing Address =====
    doc.fontSize(12).fillColor('#1f4e78').text('Billed To:', billingX, currentY, { underline: true });
    doc.fontSize(10).fillColor('#000')
      .text(`Name: ${orderData.user?.name || 'N/A'}`, billingX, currentY + 15)
      .text(`Email: ${orderData.user?.email || 'N/A'}`, billingX, currentY + 30)
      .text(`Phone: ${orderData.user?.phone || 'N/A'}`, billingX, currentY + 45);

    const addressBilling = `Address: ${orderData.user?.address || 'N/A'}`;
    doc.text(addressBilling, billingX, currentY + 60, { width: 200 });
    const addressBillingHeight = doc.heightOfString(addressBilling, { width: 200 });

    doc.text(`City: ${orderData.user?.city || 'N/A'}`, billingX, currentY + 60 + addressBillingHeight + 5)
       .text(`State: ${orderData.user?.state || 'N/A'}`, billingX)
       .text(`Pincode: ${orderData.user?.pincode || 'N/A'}`, billingX);

    // ===== Shipping Address =====
    doc.fontSize(12).fillColor('#1f4e78').text('Shipping Address:', shippingX, currentY, { underline: true });
    doc.fontSize(10).fillColor('#000')
      .text(`Name: ${orderData.user?.name || 'N/A'}`, shippingX, currentY + 15)
      .text(`Phone: ${orderData.user?.phone || 'N/A'}`, shippingX, currentY + 30);

    const addressShipping = `Address: ${orderData.user?.address || 'N/A'}`;
    doc.text(addressShipping, shippingX, currentY + 45, { width: 200 });
    const addressShippingHeight = doc.heightOfString(addressShipping, { width: 200 });

    doc.text(`City: ${orderData.user?.city || 'N/A'}`, shippingX, currentY + 45 + addressShippingHeight + 5)
       .text(`State: ${orderData.user?.state || 'N/A'}`, shippingX)
       .text(`Pincode: ${orderData.user?.pincode || 'N/A'}`, shippingX);

    doc.moveDown(4);

    // ================= TABLE HEADER =================
    const tableTop = doc.y;
    const itemX = 50;
    const columns = { sno: itemX, name: itemX + 40, qty: itemX + 250, price: itemX + 310, total: itemX + 400 };

    doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
       .text('S.No', columns.sno, tableTop)
       .text('Product', columns.name, tableTop)
       .text('Qty', columns.qty, tableTop)
       .text('Price (₹)', columns.price, tableTop)
       .text('Total (₹)', columns.total, tableTop)
       .moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // ================= TABLE BODY =================
    let yPos = tableTop + 25;
    doc.font('Helvetica').fontSize(11);

    orderData.products.forEach((item, index) => {
      const lineTotal = item.quantity * item.price;
      if (index % 2 === 0) {
        doc.rect(itemX, yPos - 3, 500, 20).fill('#f3f6f6').fillColor('#000');
      }
      doc.text(index + 1, columns.sno, yPos)
         .text(item.name, columns.name, yPos)
         .text(item.quantity, columns.qty, yPos)
         .text(`₹${item.price}`, columns.price, yPos)
         .text(`₹${lineTotal}`, columns.total, yPos);

      yPos += 20;
      doc.moveTo(itemX, yPos - 3).lineTo(550, yPos - 3).strokeColor('#eee').stroke();
    });

    // ================= TOTAL AMOUNT =================
    doc.moveDown(5).font('Helvetica-Bold').fontSize(13).fillColor('#000')
       .text(`Grand Total: ₹${orderData.totalAmount}`, { align: 'right' });

    // ================= FOOTER =================
    doc.moveDown(2).fontSize(10).font('Helvetica-Oblique').fillColor('#777')
       .text('This invoice is auto-generated and does not require a signature.', { align: 'center' })
       .text('Thank you for shopping with us!', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      console.log('✅ Invoice PDF generated successfully!');
      resolve();
    });

    stream.on('error', (err) => {
      console.error('❌ Error generating invoice PDF:', err);
      reject(err);
    });
  });
};

module.exports = generateInvoice;
