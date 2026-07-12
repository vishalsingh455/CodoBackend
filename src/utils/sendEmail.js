// import nodemailer from 'nodemailer'

// const sendEmail = async ({ to, subject, html }) => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     })

//     await transporter.sendMail({
//         from: `"CODO" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html
//     })
// }

// export default sendEmail;


import nodemailer from 'nodemailer'

const sendEmail = async ({ to, subject, html, replyTo }) => {
    const transporter = nodemailer.createTransport({
        // Switching from service: "gmail" to explicit host/port configurations
        // is much more reliable and bypasses common hosting port blocks.
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // false for port 587 (it starts unencrypted then upgrades via STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    await transporter.sendMail({
        from: `"CODO" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        replyTo: replyTo || process.env.EMAIL_USER
    })
}

export default sendEmail;

