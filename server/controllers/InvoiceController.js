const PDFDocument = require("pdfkit")
const path = require("path")
const fs = require("fs")
const Checkout = require("../models/Checkout")
const Invoice = require("../models/Invoice")

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    brand:      "#0a2540",
    brandMid:   "#1a4a7a",
    brandLight: "#e8f0f8",
    teal:       "#0d7a6e",
    tealBg:     "#e6f4f2",
    tealDark:   "#085041",
    amber:      "#b45309",
    amberBg:    "#fef3c7",
    amberDark:  "#633806",
    blueBg:     "#e6f1fb",
    blueDark:   "#0c447c",
    ink:        "#1a2634",
    inkMid:     "#4a5e70",
    inkLight:   "#8096a8",
    border:     "#d1dbe5",
    rule:       "#e8eef4",
    rowAlt:     "#f5f8fb",
    white:      "#ffffff",
    offwhite:   "#f7fafd",
}

const F = { h1: 22, h2: 15, h3: 11, body: 9.5, small: 8.5, tiny: 7.5 }

// ── Helpers ───────────────────────────────────────────────────────────────────
const currency = (n) =>
    `Rs. ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (d) =>
    new Date(d || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

function rect(doc, x, y, w, h, fill, rx = 0) {
    doc.save()
    if (rx > 0) doc.roundedRect(x, y, w, h, rx).fill(fill)
    else doc.rect(x, y, w, h).fill(fill)
    doc.restore()
}

function strokeRect(doc, x, y, w, h, strokeColor, lw = 0.5, rx = 0) {
    doc.save()
    if (rx > 0) doc.roundedRect(x, y, w, h, rx).lineWidth(lw).strokeColor(strokeColor).stroke()
    else doc.rect(x, y, w, h).lineWidth(lw).strokeColor(strokeColor).stroke()
    doc.restore()
}

function hRule(doc, y, x1 = 40, x2 = 555, color = "#e8eef4", lw = 0.5) {
    doc.save().strokeColor(color).lineWidth(lw).moveTo(x1, y).lineTo(x2, y).stroke().restore()
}

function pill(doc, x, y, label, bgColor, textColor) {
    doc.fontSize(F.tiny).font("Helvetica-Bold")
    const pw = doc.widthOfString(label) + 14
    rect(doc, x, y, pw, 13, bgColor, 6)
    doc.fillColor(textColor).text(label, x + 7, y + 2, { lineBreak: false })
}

// ── PDF Builder ───────────────────────────────────────────────────────────────
function buildPDF(order, invoiceNumber) {
    return new Promise((resolve, reject) => {
        const invoicesDir = path.join(__dirname, "../public/invoices")
        if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true })

        const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`)
        const stream   = fs.createWriteStream(filePath)

        const customer    = order.user        || {}
        const products    = Array.isArray(order.products) ? order.products : []
        const subtotal    = Number(order.subtotal   || 0)
        const shipping    = Number(order.shipping   || 0)
        const total       = Number(order.total      || subtotal + shipping)
        const orderDate   = fmtDate(order.createdAt)
        const payMode     = order.paymentMode   || "COD"
        const payStatus   = order.paymentStatus || "Pending"
        const orderStatus = order.orderStatus   || "Placed"
        const deliveryBoy = order.deliveryBoy   || null

        const siteName    = process.env.SITE_NAME    || "MyShop"
        const siteAddress = process.env.SITE_ADDRESS || "123 Main Street, New Delhi, India"
        const siteEmail   = process.env.SITE_EMAIL   || "support@myshop.com"
        const sitePhone   = process.env.SITE_PHONE   || "+91 98765 43210"

        const doc = new PDFDocument({ margin: 0, size: "A4" })
        doc.pipe(stream)

        const W = 595, M = 40

        // ── PAGE BACKGROUND ───────────────────────────────────────────────────
        rect(doc, 0, 0, W, 841, C.offwhite)

        // ── HEADER ────────────────────────────────────────────────────────────
        rect(doc, 0, 0, W, 118, C.brand)

        // Subtle circle decorations
        doc.save().opacity(0.05)
        doc.circle(480, -20, 100).fill(C.white)
        doc.circle(520, 80, 70).fill(C.white)
        doc.restore()

        // Brand name (left)
        doc.fontSize(F.h1).font("Helvetica-Bold").fillColor(C.white).text(siteName, M, 26)
        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.45)")
           .text(siteAddress, M, 54)
           .text(`${siteEmail}  ·  ${sitePhone}`, M, 66)

        // Invoice label + number (right)
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor("rgba(255,255,255,0.40)")
           .text("INVOICE", 0, 26, { align: "right", width: W - M, characterSpacing: 2 })
        doc.fontSize(F.h2).font("Helvetica-Bold").fillColor(C.white)
           .text(invoiceNumber, 0, 40, { align: "right", width: W - M })
        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.45)")
           .text(orderDate, 0, 64, { align: "right", width: W - M })

        // Teal accent bar
        rect(doc, 0, 118, W, 3, C.teal)

        // ── BILL TO + ORDER DETAILS ───────────────────────────────────────────
        let y = 140

        // Left: Bill To
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.teal)
           .text("BILL TO", M, y, { characterSpacing: 1.5 })
        y += 13

        doc.fontSize(F.h3).font("Helvetica-Bold").fillColor(C.ink)
           .text(customer.name || "—", M, y)
        y += 15

        doc.fontSize(F.body).font("Helvetica").fillColor(C.inkMid)
        const addr = [customer.address, customer.city, customer.state, customer.pin].filter(Boolean)
        if (addr.length) {
            doc.text(addr.join(", "), M, y, { width: 215 })
            y += doc.heightOfString(addr.join(", "), { width: 215 }) + 4
        }
        if (customer.phone) { doc.text(`Phone: ${customer.phone}`, M, y); y += 13 }
        if (customer.email) { doc.text(`Email: ${customer.email}`, M, y); y += 13 }

        // Right: Order Info Card
        const cx = 328, cy = 138, cw = 227
        const infoRows = [
            ["Order ID",     String(order._id || invoiceNumber).slice(-12)],
            ["Payment Mode", payMode],
            ["Order Status", orderStatus],
        ]
        if (deliveryBoy) infoRows.push(["Delivery By", deliveryBoy.name || String(deliveryBoy)])
        const cardH = 22 + infoRows.length * 18 + 22 + 10

        rect(doc, cx, cy, cw, cardH, C.white, 5)
        strokeRect(doc, cx, cy, cw, cardH, C.border, 0.5, 5)

        // Card header band
        rect(doc, cx, cy, cw, 20, C.brandLight, 5)
        rect(doc, cx, cy + 14, cw, 6, C.brandLight)
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor(C.brandMid)
           .text("ORDER DETAILS", cx + 12, cy + 6, { characterSpacing: 1 })

        let iy = cy + 26
        infoRows.forEach(([label, val]) => {
            doc.fontSize(F.small).font("Helvetica-Bold").fillColor(C.inkLight)
               .text(label, cx + 12, iy, { width: 88 })
            doc.fontSize(F.small).font("Helvetica").fillColor(C.ink)
               .text(val, cx + 106, iy, { width: 109 })
            hRule(doc, iy + 14, cx, cx + cw, C.rule, 0.4)
            iy += 18
        })

        // Payment status pill row
        doc.fontSize(F.small).font("Helvetica-Bold").fillColor(C.inkLight)
           .text("Payment Status", cx + 12, iy, { width: 88 })
        const isPaid  = /paid|success/i.test(payStatus)
        pill(doc, cx + 106, iy, payStatus,
            isPaid ? C.tealBg  : C.amberBg,
            isPaid ? C.tealDark : C.amberDark)

        // ── ITEMS TABLE ───────────────────────────────────────────────────────
        y = Math.max(y + 24, cy + cardH + 20)

        const tableW = W - 2 * M  // 515
        const col = {
            no:    { x: M,       w: 24  },
            name:  { x: M + 28,  w: 295 },
            qty:   { x: M + 326, w: 52  },
            price: { x: M + 378, w: 68  },
            total: { x: M + 446, w: 69  },
        }

        // ── Table header row
        const hh = 24
        rect(doc, M, y, tableW, hh, C.brand)
        doc.fontSize(F.tiny).font("Helvetica-Bold").fillColor("rgba(255,255,255,0.8)")
        ;[
            ["#",       col.no,    "center"],
            ["PRODUCT", col.name,  "left"  ],
            ["QTY",     col.qty,   "center"],
            ["PRICE",   col.price, "right" ],
            ["TOTAL",   col.total, "right" ],
        ].forEach(([label, c, align]) =>
            doc.text(label, c.x, y + 7, { width: c.w, align, characterSpacing: 0.8 })
        )
        y += hh

        // ── Table body rows
        products.forEach((p, i) => {
            const rh        = 22
            const name      = p.name || p.product?.name || "—"
            const qty       = p.qty  || p.quantity || 1
            const price     = Number(p.price || p.product?.finalPrice || 0)
            const lineTotal = Number(p.total || price * qty)

            rect(doc, M, y, tableW, rh, i % 2 === 0 ? C.white : C.rowAlt)
            hRule(doc, y, M, M + tableW, C.rule, 0.4)

            doc.fontSize(F.small).font("Helvetica").fillColor(C.inkLight)
               .text(String(i + 1), col.no.x, y + 6, { width: col.no.w, align: "center" })
            doc.font("Helvetica-Bold").fillColor(C.ink)
               .text(name, col.name.x, y + 6, { width: col.name.w, ellipsis: true })
            doc.font("Helvetica").fillColor(C.inkMid)
               .text(String(qty),         col.qty.x,   y + 6, { width: col.qty.w,   align: "center" })
               .text(currency(price),     col.price.x, y + 6, { width: col.price.w, align: "right" })
            doc.font("Helvetica-Bold").fillColor(C.ink)
               .text(currency(lineTotal), col.total.x, y + 6, { width: col.total.w, align: "right" })
            y += rh
        })

        // Table bottom border
        hRule(doc, y, M, M + tableW, C.border, 0.8)
        y += 14

        // ── TOTALS (right-aligned footer) ─────────────────────────────────────
        const totX  = 370
        const totRW = M + tableW - totX   // right zone width

        function totRow(label, val, muted = true) {
            doc.fontSize(F.body)
               .font(muted ? "Helvetica" : "Helvetica-Bold")
               .fillColor(muted ? C.inkLight : C.ink)
               .text(label, totX, y, { width: 80 })
            doc.font(muted ? "Helvetica" : "Helvetica-Bold")
               .fillColor(muted ? C.inkMid : C.ink)
               .text(val, totX + 80, y, { width: totRW - 80, align: "right" })
            y += 16
        }

        totRow("Subtotal",         currency(subtotal))
        totRow("Shipping charges", currency(shipping))
        hRule(doc, y, totX, M + tableW, C.border, 0.5)
        y += 8

        // Grand total highlighted row
        rect(doc, totX - 10, y - 4, totRW + 10, 24, C.brand, 4)
        doc.fontSize(F.body).font("Helvetica-Bold").fillColor(C.white)
           .text("Grand Total", totX, y + 2, { width: 80 })
           .text(currency(total), totX + 80, y + 2, { width: totRW - 80, align: "right" })
        y += 32

        // ── THANK YOU BAR ─────────────────────────────────────────────────────
        rect(doc, M, y, tableW, 52, C.white, 5)
        strokeRect(doc, M, y, tableW, 52, C.border, 0.5, 5)
        // Left teal accent bar (flatten right corners manually)
        rect(doc, M, y, 4, 52, C.teal)

        doc.fontSize(F.body).font("Helvetica-Bold").fillColor(C.ink)
           .text("Thank you for shopping with us!", M + 18, y + 12)
        doc.fontSize(F.small).font("Helvetica").fillColor(C.inkMid)
           .text(`Questions? ${siteEmail}  ·  Returns accepted within 7 days of delivery.`, M + 18, y + 28)

        // ── FOOTER ────────────────────────────────────────────────────────────
        rect(doc, 0, 795, W, 46, C.brand)
        doc.fontSize(F.tiny).font("Helvetica").fillColor("rgba(255,255,255,0.35)")
           .text(
               `© ${new Date().getFullYear()} ${siteName}  ·  All rights reserved  ·  Computer-generated invoice, no signature required.`,
               0, 813, { align: "center", width: W }
           )

        doc.end()
        stream.on("finish", () => resolve(filePath))
        stream.on("error",  reject)
    })
}

// ── Route handler ─────────────────────────────────────────────────────────────
async function createInvoice(req, res) {
    try {
        const { orderId } = req.body
        if (!orderId) return res.status(400).json({ result: "Fail", reason: "orderId is required." })

        const order = await Checkout.findById(orderId)
            .populate("user")
            .populate("products.product")
            .populate("deliveryBoy")

        if (!order) return res.status(404).json({ result: "Fail", reason: "Order not found." })

        const existing = await Invoice.findOne({ order: orderId })
        if (existing) return res.json({ result: "Done", invoice: { invoiceNumber: existing.invoiceNumber } })

        const datePart      = new Date().toISOString().slice(0, 10).replace(/-/g, "")
        const rand          = Math.floor(1000 + Math.random() * 9000)
        const invoiceNumber = `INV-${datePart}-${rand}`

        await buildPDF(order, invoiceNumber)

        await new Invoice({
            user:          order.user?._id || order.user,
            order:         order._id,
            invoiceNumber,
        }).save()

        res.json({ result: "Done", invoice: { invoiceNumber } })

    } catch (error) {
        console.error("Invoice generation error:", error)
        res.status(500).json({ result: "Fail", reason: "Failed to generate invoice." })
    }
}

module.exports = { createInvoice }