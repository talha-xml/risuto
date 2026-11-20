/**
 * Brevo Transactional Email Service via HTTPS (Port 443)
 * Uses standard REST API to bypass cloud provider SMTP port blocking (Render/AWS/etc.)
 */
const sendEmail = async ({ to, subject, html }) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const senderEmail = (
    process.env.BREVO_SENDER ||
    process.env.BREVO_USER ||
    process.env.EMAIL_USER ||
    ''
  ).trim();

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }

  if (!senderEmail) {
    throw new Error('BREVO_SENDER is not set in environment variables (must be your verified Brevo email)');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'Risuto',
        email: senderEmail
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || (data.errors && JSON.stringify(data.errors)) || 'Failed to send email';
    throw new Error(`Brevo API Error (${response.status}): ${errorMsg}`);
  }

  return data;
};

module.exports = { sendEmail };
