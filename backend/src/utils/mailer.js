import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";

class Email {
  constructor(user, claim = null, url = null) {
    this.to = user.email;
    this.firstname = user.firstname;
    this.password = user.password;
    this.url = url;
    this.email = user.email;
    this.from = 'floralink.2025@gmail.com'; // Hardcoded sender address
    this.message = claim ? claim.message : '';  // Default empty message if not provided
    this.title = ''; // Add this line
  }

  // Create a transporter object using SMTP transport
  createTransport() {
    return nodemailer.createTransport({
      service: 'gmail', // or your email service provider
      auth: {
        user: 'floralink.2025@gmail.com', // Hardcoded email user
        pass: 'tokw jgsr fsgg pozg', // Hardcoded email password or app password
      },
    });
  }

  // Send the actual email
  async send(template, subject, data = {}) {
    const transporter = this.createTransport();

    // 1) Render HTML based on an ejs template
    const html = await ejs.renderFile(
      path.join(__dirname, `./../views/email/${template}.ejs`),
      {
        firstname: this.firstname,
        password: this.password,
        email: this.email,
        message: data.message || this.message,
        url: this.url,
        title: data.title || 'FloraLink Notification', // Add default title
      }
    );

    // 2) Define email options
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      text: data.title || subject, // Use provided title or subject as fallback
      html,
    };

    // 3) Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Propagate the error
    }
  }

  async sendAccountAdded() {
    await this.send("accountAdded", "Welcome! Now", {
      title: "Welcome to FloraLink"
    });
  }

  async sendNotification(data = {}) {
    try {
      return this.send('Notification', 'notification');
    } catch (error) {
      console.error('Email notification failed:', error);
      // Return resolved promise to prevent blocking
      return Promise.resolve();
    }
  }

  async sendResetPasswordCode() {
    await this.send("ResetPasswordCode", "Your Reset Password Code", {
      title: "Password Reset Request"
    });
  }
}

export default Email;
