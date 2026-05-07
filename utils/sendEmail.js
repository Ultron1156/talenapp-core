const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        console.log('⏳ Email sending process started (Direct IP Bypass)...');

        // 1. Postacıyı (Transporter) Doğrudan IP ile oluşturuyoruz!
        const transporter = nodemailer.createTransport({
            host: "142.251.127.108", // DİKKAT: Senin ping testinden aldığımız direkt Google sunucu IP'si!
            port: 465, // Güvenli port
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                servername: "smtp.gmail.com", // Google'a "Ben aslında adınla geldim" diyoruz ki güvenlikten atsın.
                rejectUnauthorized: false // Yerel ağındaki (Localhost) gizli engelleri aşmak için
            },
            connectionTimeout: 10000 
        });

        // 2. E-postanın içeriği
        const mailOptions = {
            from: `"TALEN Verification" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
        };

        // 3. E-postayı fırlat!
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email successfully sent! MessageId:', info.messageId);
        
    } catch (error) {
        console.error('❌ Email sending error:', error);
        throw new Error('Email could not be sent'); 
    }
};

module.exports = sendEmail;