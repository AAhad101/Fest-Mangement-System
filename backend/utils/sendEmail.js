const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

/**
 * Sends a registration ticket email with a QR code attachment.
 * Fulfills requirements for Normal and Merchandise events.
 */
const sendTicketEmail = async (options) => {
    // Create the transporter using Gmail's SMTP settings
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // 16-character App Password (no spaces)
        },
    });

    try {
        // Generate the QR image as a Data URL
        const qrImageURL = await QRCode.toDataURL(options.qrCode);

        // Remove the header (e.g., "data:image/png;base64,") to get just the base64 string
        const base64Data = qrImageURL.replace(/^data:image\/png;base64,/, "");

        const mailOptions = {
            from: `"Felicity 2026" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: `Ticket Confirmation: ${options.eventName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #2d3436;">Registration Successful!</h2>
                    <p>Hi ${options.userName},</p>
                    <p>Your spot for <b>${options.eventName}</b> is confirmed.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><b>Ticket ID:</b> ${options.ticketId}</p>
                        <p><b>Event Type:</b> ${options.eventType}</p>
                    </div>
                    <p>Your unique QR code is attached to this email. Please present it at the venue for entry or collection.</p>
                    <p>Best regards,<br/>Club Council, IIIT Hyderabad</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'ticket-qr.png',
                    // Convert the base64 string into a Buffer for a valid image attachment
                    content: Buffer.from(base64Data, 'base64'),
                    contentType: 'image/png',
                    cid: 'ticketqr' 
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Ticket email sent successfully: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error in sendTicketEmail utility:", error.message);
        throw error; // Re-throw to be caught by the registrationController
    }
};

module.exports = sendTicketEmail;
