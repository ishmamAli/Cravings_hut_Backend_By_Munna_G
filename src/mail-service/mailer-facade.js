const { constructContext } = require("./context-factory");
const handleBarOptions = require("./handle-bar-options");
const hbs = require("nodemailer-express-handlebars");
const ContextFactory = require("./context-factory");
const header = require("./common/header");
const nodemailer = require("nodemailer");
const config = require("./../config/config");

class MailerFacade {
  constructor() {}

  static async createTransport() {
    return nodemailer.createTransport(config.email.smtp);
  }

  constructContext(emailType, ...args) {
    return ContextFactory.constructContext(emailType, ...args);
  }

  static getAttachments(extraAttach) {
    const attachments = [
      {
        filename: "logo.png",
        path: __dirname + "/public/logo.png",
        cid: "logo@image",
      },
      {
        filename: "google.png",
        path: __dirname + "/public/google.png",
        cid: "google@image",
      },
      {
        filename: "apple.png",
        path: __dirname + "/public/apple.png",
        cid: "apple@image",
      },
      {
        filename: "linkedin.png",
        path: __dirname + "/public/linkedin.png",
        cid: "linkedin@image",
      },
      {
        filename: "facebook.png",
        path: __dirname + "/public/facebook.png",
        cid: "facebook@image",
      },
      {
        filename: "instagram.png",
        path: __dirname + "/public/instagram.png",
        cid: "instagram@image",
      },
      {
        filename: "twitter.png",
        path: __dirname + "/public/twitter.png",
        cid: "twitter@image",
      },
    ];
    return attachments.concat(extraAttach);
  }

  static logoAttachments(extraAttach) {
    const attachments = [
      {
        filename: "logo.png",
        path: __dirname + "/public/logo.png",
        cid: "logo@image",
      },
    ];
    return attachments.concat(extraAttach);
  }

  static async sendEmail(to, subject, emailType, extraAttach = [], bcc = [], ...args) {
    const newTransporter = await this.createTransport();
    newTransporter.use("compile", hbs(handleBarOptions));
    const context = { ...constructContext(emailType, ...args), header };
    const mailOptions = {
      from: `"Suren" ${config.email.from}`,
      to,
      subject,
      template: emailType,
      context,
      attachments: this.logoAttachments(extraAttach),
      bcc,
    };
    return await newTransporter.sendMail(mailOptions);
  }
}

module.exports = MailerFacade;
