const path = require('path');
const fs = require('fs');
const Checkout = require('../models/Checkout');
const Invoice = require('../models/Invoice');
const generateInvoice = require('../middleware/invoiceGenerator');

exports.createInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    // 🔹 Check if invoice already exists in DB
    let invoice = await Invoice.findOne({ order: orderId });
    const pdfDir = path.join(__dirname, '../public/invoice');

    if (invoice) {
      const pdfPath = path.join(pdfDir, `${invoice.invoiceNumber}.pdf`);
      // 🔹 Check if file exists on disk
      if (fs.existsSync(pdfPath)) {
        return res.status(200).json({ message: 'Invoice already exists', invoice });
      } else {
        // File missing, regenerate PDF
        fs.mkdirSync(pdfDir, { recursive: true });

        const order = await Checkout.findById(orderId)
          .populate('user')
          .populate('products.product');

        const orderData = {
          invoiceNumber: invoice.invoiceNumber,
          user: order.user,
          products: order.products.map(p => ({
            name: p.product.name,
            quantity: p.qty,
            price: p.product.finalPrice,
          })),
          totalAmount: order.total,
        };

        await generateInvoice(orderData, pdfPath);
        return res.status(200).json({ message: 'Invoice regenerated', invoice });
      }
    }

    // 🔹 If invoice does not exist in DB, create new
    const order = await Checkout.findById(orderId)
      .populate('user')
      .populate('products.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const invoiceNumber = `INV-${order._id}`;
    fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, `${invoiceNumber}.pdf`);

    const orderData = {
      invoiceNumber,
      user: order.user,
      products: order.products.map(p => ({
        name: p.product.name,
        quantity: p.qty,
        price: p.product.finalPrice,
      })),
      totalAmount: order.total,
    };

    await generateInvoice(orderData, pdfPath);

    invoice = await Invoice.create({
      invoiceNumber,
      user: order.user._id,
      order: order._id,
      totalAmount: order.total,
      pdfUrl: `/invoices/${invoiceNumber}.pdf`,
    });

    res.status(201).json({ message: 'Invoice generated', invoice });

  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};
