const ForgotPasswordContext = require("./context/forgot-password");
const WelcomeEmailContext = require("./context/welcome-email");
const CredentialsContext = require("./context/credentials");
const AdminCreatedContext = require("./context/admin-created");
const BuildingPublishContext = require("./context/building-publish");
const MailTypes = require("./mail-types");

class ContextFactory {
  constructor() {}

  static constructContext(type, ...args) {
    switch (type) {
      case MailTypes.ForgotPassword:
        return new ForgotPasswordContext(...args).getContext();
      case MailTypes.WelcomeEmail:
        return new WelcomeEmailContext(...args).getContext();
      case MailTypes.Credentials:
        return new CredentialsContext(...args).getContext();
      case MailTypes.AdminCreated:
        return new AdminCreatedContext(...args).getContext();
      case MailTypes.BuildingPublish:
        return new BuildingPublishContext(...args).getContext();
    }
  }
}

module.exports = ContextFactory;
