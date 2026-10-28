// Quote requests from quote.html. Sends two emails from hi@bhavyasevents.com:
// the request to the business inbox, and a thank-you to the customer.
// Settings come from Netlify environment variables (see .env.example); nothing secret is in this file.
import nodemailer from 'nodemailer';
import { EMAIL_LOGO_PNG } from './lib/email-logo.mjs';

export const config = { path: '/api/quote' };

const PHONE = '(248) 716-4603';
const INSTAGRAM = 'https://www.instagram.com/celebratewithbhavyas/';

const env = key => (process.env[key] || '').trim();
const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// "2027-01-27" -> "January 27, 2027"
const longDate = iso => {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)));
};

const logo = { filename: 'celebrate-with-bhavyas.png', content: Buffer.from(EMAIL_LOGO_PNG, 'base64'), cid: 'bhavyas-logo' };

// Shared frame: charcoal header with the logo, cream card, charcoal footer
const frame = (inner, preheader) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#f8f2e4;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f2e4;"><tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #eadcb8;">
    <tr><td align="center" bgcolor="#17161a" style="background:#17161a;padding:26px 20px;">
      <img src="cid:bhavyas-logo" width="440" alt="Celebrate with Bhavya's" style="display:block;width:100%;max-width:440px;height:auto;border:0;">
    </td></tr>
    <tr><td style="height:3px;background:#c9a54c;line-height:3px;font-size:0;">&nbsp;</td></tr>
    <tr><td style="padding:36px 36px 30px;font-family:Georgia,'Times New Roman',serif;color:#1f1d22;">
${inner}
    </td></tr>
    <tr><td bgcolor="#17161a" style="background:#17161a;padding:22px 30px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#cfc8bb;text-align:center;">
      Celebrate with Bhavya's &middot; Event Planning &amp; Decor &middot; Farmington Hills, Michigan<br>
      <a href="tel:+12487164603" style="color:#e6cc85;text-decoration:none;">${PHONE}</a> &middot;
      <a href="mailto:hi@bhavyasevents.com" style="color:#e6cc85;text-decoration:none;">hi@bhavyasevents.com</a> &middot;
      <a href="${INSTAGRAM}" style="color:#e6cc85;text-decoration:none;">Instagram</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

// A short "here's what we received" box so customers can see their details came through
const summaryHtml = summary => !summary.length ? '' : `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px;background:#f8f2e4;border:1px solid #eadcb8;">
        <tr><td style="padding:18px 22px 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#1d6890;">Here's what we received</td></tr>
${summary.map(([label, value]) => `        <tr><td style="padding:6px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1f1d22;"><span style="color:#8a8379;">${escapeHtml(label)}:</span> ${escapeHtml(value)}</td></tr>`).join('\n')}
        <tr><td style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>
      </table>`;

const thankYouHtml = (firstName, summary = []) => frame(`
      <p style="margin:0 0 18px;font-size:26px;line-height:1.3;color:#1f1d22;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 16px;font-size:17px;line-height:1.7;">Thank you for reaching out to <strong>Celebrate with Bhavya's</strong>! We've received your request and are so excited to hear about your celebration.</p>
${summaryHtml(summary)}
      <p style="margin:0 0 16px;font-size:17px;line-height:1.7;">Our team will review your details and get back to you shortly. If your event is coming up soon or you'd like to talk sooner, call us anytime at <a href="tel:+12487164603" style="color:#8f6c1e;font-weight:bold;text-decoration:none;">${PHONE}</a>.</p>
      <p style="margin:0 0 28px;font-size:17px;line-height:1.7;">In the meantime, you can see more of our work on Instagram.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 30px;"><tr><td bgcolor="#c9a54c" style="background:#c9a54c;border-radius:999px;">
        <a href="${INSTAGRAM}" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#17161a;text-decoration:none;">See our work</a>
      </td></tr></table>
      <p style="margin:0;font-size:17px;line-height:1.6;">Warm regards,<br><span style="font-size:20px;color:#8f6c1e;">Bharathi &amp; Divya</span><br><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#1d6890;">Celebrate with Bhavya's</span></p>`,
  "We've received your request and will be in touch shortly.");

const thankYouText = (firstName, summary = []) => `Hi ${firstName},

Thank you for reaching out to Celebrate with Bhavya's! We've received your request and are so excited to hear about your celebration.
${summary.length ? `\nHere's what we received:\n${summary.map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n` : ''}
Our team will review your details and get back to you shortly. If your event is coming up soon or you'd like to talk sooner, call us anytime at ${PHONE}.

In the meantime, you can see more of our work on Instagram: ${INSTAGRAM}

Warm regards,
Bharathi & Divya
Celebrate with Bhavya's
We Create! You Celebrate!!
hi@bhavyasevents.com · ${PHONE}`;

const requestHtml = rows => frame(`
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#1d6890;">New quote request</p>
      <p style="margin:0 0 22px;font-size:24px;line-height:1.3;">${escapeHtml(rows.find(([k]) => k === 'Name')?.[1] || '')}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows.map(([label, value]) => `        <tr>
          <td valign="top" style="padding:10px 12px 10px 0;border-top:1px solid #eadcb8;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a8379;width:34%;">${escapeHtml(label)}</td>
          <td valign="top" style="padding:10px 0;border-top:1px solid #eadcb8;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1f1d22;">${escapeHtml(value).replaceAll('\n', '<br>')}</td>
        </tr>`).join('\n')}
      </table>
      <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5d5862;">Reply to this email to answer them directly.</p>`,
  'A new quote request just came in.');

export default async req => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  let data;
  try { data = await req.json(); } catch { return json(400, { ok: false, error: 'Invalid request' }); }
  if (!data || typeof data !== 'object') return json(400, { ok: false, error: 'Invalid request' });
  if (data._honey) return json(200, { ok: true });                           // hidden field only bots fill in

  // Every row except our own "_" settings goes in the email, in the order the form sent them
  const rows = Object.entries(data)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => [key.slice(0, 60), String(value ?? '').slice(0, 2000)]);
  const field = name => (rows.find(([k]) => k === name) || [])[1] || '';
  const name = field('Name').trim();
  const email = field('Email').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || rows.length > 30) {
    return json(400, { ok: false, error: 'Please check your name and email.' });
  }

  const host = env('SMTP_HOST'), user = env('SMTP_USER'), pass = env('SMTP_PASSWORD');
  if (!host || !user || !pass) return json(503, { ok: false, error: 'Email is not set up yet' });
  const port = Number(env('SMTP_PORT') || 465);
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const from = env('MAIL_FROM') || `Celebrate with Bhavya's <${user}>`;
  const to = env('MAIL_TO') || user;

  const date = field('Event date');
  const lookingFor = field('Looking for');
  const firstName = name.split(/\s+/)[0];
  // Dates read naturally everywhere: "2027-01-25" -> "January 25, 2027"
  const shownRows = rows.map(([k, v]) => [k, v.replace(/\b\d{4}-\d{2}-\d{2}\b/g, longDate)]);
  // What the customer sees back: only what they told us, skipping anything blank
  const blank = v => !v || /^\((none|not given|not asked)\)$/.test(v);
  const summary = [['Event date', 'Event date'], ['More days', 'Additional days'], ['Location', 'Location'], ['Looking for', 'Looking for'], ['Services needed', 'Services'], ['Budget', 'Budget'], ['Venue', 'Venue']]
    .map(([key, label]) => [label, (shownRows.find(([k]) => k === key) || [])[1]])
    .filter(([, value]) => !blank(value) && value !== '(decor only)');

  try {
    await transporter.sendMail({
      from, to, replyTo: `${name} <${email}>`,
      subject: `New quote request${lookingFor ? ` (${lookingFor}${field('Location').startsWith('Destination') ? ', destination' : ''})` : ''}: ${name}${date ? `, ${longDate(date)}` : ''}`,
      text: shownRows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: requestHtml(shownRows),
      attachments: [logo]
    });
  } catch (err) {
    console.error('Request email failed:', err.message);
    return json(502, { ok: false, error: 'Could not send right now' });
  }

  // The request is safely in the inbox; a failed thank-you shouldn't show the customer an error
  try {
    await transporter.sendMail({
      from, to: `${name} <${email}>`, replyTo: to,
      subject: "Thank you for reaching out to Celebrate with Bhavya's",
      text: thankYouText(firstName, summary),
      html: thankYouHtml(firstName, summary),
      attachments: [logo]
    });
  } catch (err) {
    console.error('Thank-you email failed:', err.message);
  }

  return json(200, { ok: true });
};
