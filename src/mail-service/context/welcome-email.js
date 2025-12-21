class WelcomeEmailContext {
  constructor(userName, otp) {
    this.userName = userName;
    this.otp = otp;
  }

  getContext() {
    return {
      userName: this.userName,
      otp: this.otp,
    };
  }
}

module.exports = WelcomeEmailContext;
