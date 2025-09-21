// api/contact.js
const sgMail = require('@sendgrid/mail');

// SendGrid API anahtarınızı buraya ekleyin
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Gerekli alanları kontrol et
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Tüm alanları doldurunuz' });
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    // E-posta içeriğini oluştur
    const htmlContent = `
      <strong>İsim:</strong> ${name}<br>
      <strong>E-posta:</strong> ${email}<br>
      <strong>Konu:</strong> ${subject}<br>
      <strong>Mesaj:</strong><br>
      ${message.replace(/\n/g, '<br>')}
    `;

    // E-posta gönder
    const msg = {
      to: 'barisha@example.com', // Buraya kendi e-posta adresinizi yazın
      from: 'noreply@barisha.com', // SendGrid'de doğruladığınız bir e-posta adresi
      subject: `BARISHA İletişim Formu: ${subject}`,
      text: `İsim: ${name}\nE-posta: ${email}\nKonu: ${subject}\nMesaj:\n${message}`,
      html: htmlContent,
    };

    await sgMail.send(msg);

    // Başarılı yanıt
    res.status(200).json({ message: 'Mesajınız başarıyla gönderildi' });
  } catch (error) {
    console.error('E-posta gönderim hatası:', error);
    res.status(500).json({ message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
  }
};
