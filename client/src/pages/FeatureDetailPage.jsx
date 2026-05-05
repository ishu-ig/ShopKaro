import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

const featureData = {
  'Top Brands': {
    icon: 'fa-award',
    tagline: 'Only the best,\ncurated for you.',
    description:
      "We partner with 100+ globally recognised premium brands, hand-picking products that meet our strict quality benchmark. Whether you're shopping fashion, electronics, or lifestyle — every brand on ShopKaro has earned its place.",
    stats: [
      { value: '100+', label: 'Partner brands' },
      { value: '12K+', label: 'Verified products' },
      { value: '4.8★', label: 'Avg brand rating' },
    ],
    highlights: [
      'Strict brand onboarding — only verified sellers make the cut',
      'Exclusive deals and early drops from top labels',
      'New brand additions every single week',
      'Brand authenticity certificates available on request',
    ],
    faqs: [
      { q: 'How are brands selected for ShopKaro?', a: 'Every brand undergoes a 3-step verification — legal registration, product quality audit, and customer satisfaction review. Only brands passing all three are listed.' },
      { q: 'Can I filter products by brand?', a: 'Yes. Use the Brand filter on any category page or visit our dedicated Brand Store section to explore full collections from a single label.' },
    ],
  },
  '100% Original Products': {
    icon: 'fa-certificate',
    tagline: 'Authentic or\nyour money back.',
    description:
      'Every product on ShopKaro carries a digital authenticity certificate backed by our verification team. We work directly with brand distributors — cutting out grey-market middlemen entirely.',
    stats: [
      { value: '100%', label: 'Authenticity guarantee' },
      { value: '0', label: 'Counterfeit reports in 2024' },
      { value: '48 hr', label: 'Verification turnaround' },
    ],
    highlights: [
      'QR-code based authenticity check on every product',
      'Direct sourcing from brand-authorised distributors',
      'In-house quality lab for random spot checks',
      'Full refund if any product fails authenticity verification',
    ],
    faqs: [
      { q: 'How do I verify my product is original?', a: "Scan the QR code on the packaging using the ShopKaro app. You'll see the full supply chain — from manufacturer to your doorstep." },
      { q: 'What happens if I receive a fake product?', a: "File a claim within 30 days. We'll collect the item, run lab verification, and issue a 100% refund plus ₹200 credit if inauthentic." },
    ],
  },
  '7-Day Refund Policy': {
    icon: 'fa-rotate-left',
    tagline: 'Changed your mind?\nNo problem at all.',
    description:
      "Shopping should be stress-free. Our no-questions-asked 7-day refund policy gives you the freedom to buy with confidence. If it doesn't feel right — return it, and we'll make it right.",
    stats: [
      { value: '7 days', label: 'Return window' },
      { value: '24 hr', label: 'Refund processing time' },
      { value: '97%', label: 'Successful return rate' },
    ],
    highlights: [
      'Initiate returns directly from your Orders page',
      'Free doorstep pickup — we collect from you',
      'Refund to original payment method or wallet credit',
      'No restocking fee on any category whatsoever',
    ],
    faqs: [
      { q: 'Which products are not eligible for returns?', a: 'Personalised items, perishables, and items marked "non-returnable" on the product page are excluded. All others qualify under the 7-day policy.' },
      { q: 'How long does the refund take?', a: 'Once your return is picked up and verified (24–48 hours), refunds are processed within 3–5 business days to your original payment method.' },
    ],
  },
  '24/7 Customer Support': {
    icon: 'fa-headset',
    tagline: 'Always here,\nanytime you need.',
    description:
      'Our support team never sleeps. Get help via live chat, phone, or email — any hour of the day, any day of the year. Real humans, not bots, resolve your issues fast.',
    stats: [
      { value: '<2 min', label: 'Avg first response' },
      { value: '24/7', label: 'Availability' },
      { value: '4.9★', label: 'Support satisfaction' },
    ],
    highlights: [
      'Live chat, phone, and email — all monitored 24/7',
      'Dedicated order tracking assistance any hour',
      'Escalation within 1 hour for urgent issues',
      'Hindi and English support always available',
    ],
    faqs: [
      { q: 'How do I reach customer support?', a: 'Tap the chat bubble on any page, call our helpline at 1800-XXX-XXXX, or email support@shopkaro.in. All channels are monitored 24/7.' },
      { q: 'Can I track my support ticket?', a: 'Yes. Every query gets a ticket ID. Track its status in My Account → Support History, or reply to the confirmation email you receive.' },
    ],
  },
  '100,000+ Happy Customers': {
    icon: 'fa-users',
    tagline: 'A community\nbuilt on trust.',
    description:
      "Over one lakh shoppers have chosen ShopKaro for their everyday needs. We're not just an e-commerce platform — we're a community that rewards loyalty, celebrates milestones, and grows together.",
    stats: [
      { value: '1 lakh+', label: 'Happy customers' },
      { value: '4.7★', label: 'Average app rating' },
      { value: '68%', label: 'Repeat purchase rate' },
    ],
    highlights: [
      'Loyalty points on every purchase, redeemable for discounts',
      'Referral rewards — earn ₹100 per friend you bring in',
      'Exclusive member-only sales and early product access',
      'Verified buyer-only reviews you can actually trust',
    ],
    faqs: [
      { q: 'How does the loyalty programme work?', a: 'Earn 1 point per ₹10 spent. Redeem 100 points for ₹10 off your next order. Points never expire as long as your account is active.' },
      { q: 'Are customer reviews genuine?', a: 'Absolutely. Only customers who have purchased and received a product can leave a review. Each review is cross-checked against order data.' },
    ],
  },
  'Fastest Delivery': {
    icon: 'fa-truck-fast',
    tagline: 'Ordered today,\nat your door today.',
    description:
      'Speed is our promise. With fulfilment centres strategically located across India and same-day delivery in 30+ cities, your package arrives before you even finish telling someone about it.',
    stats: [
      { value: '30+', label: 'Same-day delivery cities' },
      { value: '4 hr', label: 'Express delivery window' },
      { value: '99%', label: 'On-time delivery rate' },
    ],
    highlights: [
      'Same-day delivery for orders placed before 12 PM',
      'Real-time tracking from warehouse to doorstep',
      'Temperature-controlled shipping for sensitive items',
      'Contactless delivery option available at checkout',
    ],
    faqs: [
      { q: 'How do I get same-day delivery?', a: 'Place your order before 12 PM and select "Same Day" at checkout. Available for PIN codes in 30+ cities. Eligible products carry a lightning bolt badge.' },
      { q: 'What if my order is delayed?', a: "We'll notify you proactively and issue a ₹50 delivery credit automatically for any delay beyond the promised window — no claim needed." },
    ],
  },
}

const accentPairs = [
  ['#6C63FF', '#FF6584'],
  ['#FF6584', '#FFD93D'],
  ['#43E97B', '#38F9D7'],
  ['#FA8231', '#F7B731'],
  ['#A855F7', '#EC4899'],
  ['#38BDF8', '#818CF8'],
]

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&display=swap');
:root{--bg:#0A0A0F;--surf:#111118;--surf2:#18181f;--brd:rgba(255,255,255,0.07);--brd2:rgba(255,255,255,0.14);--text:#F0F0F8;--muted:rgba(240,240,248,0.45);--muted2:rgba(240,240,248,0.22);--rad:20px;--rad-sm:10px;--tr:0.28s cubic-bezier(0.4,0,0.2,1)}
.fd-root{min-height:100vh;background:var(--bg);font-family:'Manrope',sans-serif;color:var(--text);padding-bottom:80px}

.fd-topbar{display:flex;align-items:center;justify-content:space-between;padding:18px 40px;border-bottom:1px solid var(--brd)}
.fd-logo{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:var(--text);text-decoration:none;letter-spacing:-0.02em}
.fd-logo span{color:var(--accent,#6C63FF)}
.fd-back{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font-size:0.78rem;font-weight:600;background:none;border:1px solid var(--brd);border-radius:50px;padding:8px 18px;cursor:pointer;transition:var(--tr);letter-spacing:0.06em;text-transform:uppercase}
.fd-back:hover{border-color:var(--brd2);color:var(--text)}
.fd-back svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}

.fd-hero{padding:60px 40px 52px;position:relative;overflow:hidden;border-bottom:1px solid var(--brd)}
.fd-hero-blob{position:absolute;border-radius:50%;pointer-events:none;z-index:0}
.fd-hero-inner{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;max-width:1100px;margin:0 auto}
.fd-num{font-family:'Syne',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--accent,#6C63FF);margin-bottom:14px;display:flex;align-items:center;gap:10px}
.fd-num::after{content:'';width:28px;height:1px;background:currentColor;opacity:0.5}
.fd-tagline{font-family:'Syne',sans-serif;font-size:clamp(2rem,5vw,3.6rem);font-weight:800;line-height:1.08;letter-spacing:-0.03em;white-space:pre-line;color:var(--text);margin-bottom:18px}
.fd-description{font-size:0.92rem;color:var(--muted);line-height:1.8;max-width:520px;font-weight:400}
.fd-hero-icon{width:108px;height:108px;border-radius:26px;background:var(--surf2);border:1px solid var(--brd);display:flex;align-items:center;justify-content:center;flex-shrink:0}

.fd-body{max-width:1100px;margin:0 auto;padding:52px 40px 0;display:grid;grid-template-columns:1fr 350px;gap:40px;align-items:start}

.fd-stats{display:flex;border:1px solid var(--brd);border-radius:var(--rad);overflow:hidden;margin-bottom:32px}
.fd-stat{flex:1;padding:22px 24px;border-right:1px solid var(--brd)}
.fd-stat:last-child{border-right:none}
.fd-stat-val{font-family:'Syne',sans-serif;font-size:1.65rem;font-weight:800;color:var(--text);line-height:1;margin-bottom:5px;letter-spacing:-0.02em}
.fd-stat-label{font-size:0.72rem;color:var(--muted);font-weight:500;letter-spacing:0.02em}

.fd-slabel{font-family:'Syne',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted2);margin-bottom:14px}

.fd-hlist{display:flex;flex-direction:column;gap:10px;margin-bottom:40px}
.fd-hrow{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:var(--rad-sm);background:var(--surf);border:1px solid var(--brd);font-size:0.855rem;color:var(--text);line-height:1.55;transition:var(--tr)}
.fd-hrow:hover{border-color:var(--brd2);background:var(--surf2)}
.fd-dot{width:20px;height:20px;min-width:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;margin-top:1px}
.fd-dot svg{width:10px;height:10px;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

.fd-flist{display:flex;flex-direction:column;gap:8px}
.fd-fitem{border:1px solid var(--brd);border-radius:var(--rad-sm);overflow:hidden;transition:border-color var(--tr)}
details[open].fd-fitem{border-color:rgba(108,99,255,0.3)}
.fd-fq{padding:14px 16px;font-size:0.855rem;font-weight:600;color:var(--text);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;list-style:none;background:var(--surf);transition:background var(--tr)}
.fd-fq::-webkit-details-marker{display:none}
.fd-fq:hover{background:var(--surf2)}
details[open] .fd-fq{background:var(--surf2);border-bottom:1px solid var(--brd)}
.fd-fa{padding:13px 16px;font-size:0.83rem;color:var(--muted);line-height:1.75;background:var(--surf)}
.fd-arr{width:14px;height:14px;stroke:var(--muted);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;transition:transform 0.22s}
details[open] .fd-arr{transform:rotate(180deg)}

.fd-sidebar{display:flex;flex-direction:column;gap:16px}
.fd-scard{background:var(--surf);border:1px solid var(--brd);border-radius:var(--rad);padding:22px}
.fd-stitle{font-family:'Syne',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted2);margin-bottom:14px}
.fd-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:var(--rad-sm);font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:700;letter-spacing:0.04em;text-decoration:none;transition:var(--tr);border:none;cursor:pointer;text-align:center}
.fd-cta-p{background:var(--accent,#6C63FF);color:#fff}
.fd-cta-p:hover{opacity:0.88;color:#fff}
.fd-cta-s{background:transparent;color:var(--muted);border:1px solid var(--brd);margin-top:9px}
.fd-cta-s:hover{border-color:var(--brd2);color:var(--text)}
.fd-cta svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

.fd-navlist{display:flex;flex-direction:column;gap:3px}
.fd-navbtn{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;font-size:0.8rem;font-weight:500;color:var(--muted);background:none;border:none;width:100%;text-align:left;cursor:pointer;transition:var(--tr);font-family:'Manrope',sans-serif}
.fd-navbtn:hover{background:var(--surf2);color:var(--text)}
.fd-navbtn.active{color:var(--accent,#6C63FF)}
.fd-navbtn i{font-size:0.8rem;width:15px;text-align:center;opacity:0.75}

.feature-link{background:none;border:none;padding:0;cursor:pointer;font-family:inherit}

@media(max-width:900px){
  .fd-body{grid-template-columns:1fr;padding:36px 20px 0}
  .fd-hero{padding:44px 20px 36px}
  .fd-hero-inner{grid-template-columns:1fr}
  .fd-hero-icon{display:none}
  .fd-topbar{padding:14px 20px}
  .fd-stats{flex-direction:column}
  .fd-stat{border-right:none;border-bottom:1px solid var(--brd)}
  .fd-stat:last-child{border-bottom:none}
}
`

function FeatureIcon({ icon, c1, c2 }) {
  return (
    <div className="fd-hero-icon">
      <i
        className={`fa ${icon}`}
        style={{
          fontSize: '2.2rem',
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      />
    </div>
  )
}

function CheckDot({ accent }) {
  return (
    <div className="fd-dot" style={{ background: `${accent}18` }}>
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" style={{ stroke: accent }} />
      </svg>
    </div>
  )
}

function NotFound({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: "'Manrope',sans-serif", background: '#0A0A0F', minHeight: '100vh', color: '#F0F0F8' }}>
      <p style={{ fontSize: '2rem', opacity: 0.25, marginBottom: 16 }}>404</p>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>Feature not found</h2>
      <p style={{ color: 'rgba(240,240,248,0.4)', marginBottom: 28, fontSize: '0.88rem' }}>
        No feature data matched the title passed from the features page.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{ background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '50px', padding: '11px 26px', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.82rem' }}
      >
        ← Go Back
      </button>
    </div>
  )
}

export default function FeatureDetail() {
  const location = useLocation()
  const navigate = useNavigate()

  const title = location.state?.title
  const data = featureData[title]
  const allTitles = Object.keys(featureData)

  if (!data) return <NotFound navigate={navigate} />

  const idx = allTitles.indexOf(title)
  const [c1, c2] = accentPairs[idx] || accentPairs[0]

  return (
    <>
      <style>{css}</style>
      <style>{`:root{--accent:${c1};--accent2:${c2}}`}</style>

      <div className="fd-root">

        {/* TOP BAR */}
        <div className="fd-topbar">
          <Link to="/" className="fd-logo">Shop<span>Karo</span></Link>
          <button className="fd-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
        </div>

        {/* HERO */}
        <div className="fd-hero">
          <div className="fd-hero-blob" style={{ width: 480, height: 480, background: c1, top: -200, right: -80, opacity: 0.12, filter: 'blur(90px)' }} />
          <div className="fd-hero-blob" style={{ width: 280, height: 280, background: c2, bottom: -80, left: '28%', opacity: 0.1, filter: 'blur(70px)' }} />
          <div className="fd-hero-inner">
            <div>
              <div className="fd-num">Feature {String(idx + 1).padStart(2, '0')}</div>
              <h1 className="fd-tagline">{data.tagline}</h1>
              <p className="fd-description">{data.description}</p>
            </div>
            <FeatureIcon icon={data.icon} c1={c1} c2={c2} />
          </div>
        </div>

        {/* BODY */}
        <div className="fd-body">

          {/* LEFT */}
          <div>
            <div className="fd-stats">
              {data.stats.map(s => (
                <div className="fd-stat" key={s.label}>
                  <div className="fd-stat-val">{s.value}</div>
                  <div className="fd-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="fd-slabel">What's included</div>
            <div className="fd-hlist">
              {data.highlights.map(h => (
                <div className="fd-hrow" key={h}>
                  <CheckDot accent={c1} />
                  {h}
                </div>
              ))}
            </div>

            <div className="fd-slabel">Common questions</div>
            <div className="fd-flist">
              {data.faqs.map((faq, i) => (
                <details className="fd-fitem" key={i}>
                  <summary className="fd-fq">
                    {faq.q}
                    <svg className="fd-arr" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                  </summary>
                  <div className="fd-fa">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="fd-sidebar">
            <div className="fd-scard">
              <div className="fd-stitle">Start shopping</div>
              <Link to="/shop" className="fd-cta fd-cta-p">
                Shop Now
                <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/signup" className="fd-cta fd-cta-s">
                Create Free Account
              </Link>
            </div>

            <div className="fd-scard">
              <div className="fd-stitle">All features</div>
              <div className="fd-navlist">
                {allTitles.map(t => (
                  <button
                    key={t}
                    className={`fd-navbtn${t === title ? ' active' : ''}`}
                    onClick={() => navigate('/feature-detail', { state: { title: t } })}
                  >
                    <i className={`fa ${featureData[t].icon}`} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}