const InvoiceRouter = require('express').Router()
const { createInvoice } = require('../controllers/InvoiceController');

// POST: Generate Invoice
InvoiceRouter.post('/generate', createInvoice);

module.exports = InvoiceRouter;