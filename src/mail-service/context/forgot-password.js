class ForgotPasswordContext {
  constructor(userName, otp, dynamicContent) {
    this.userName = userName;
    this.otp = otp;
    this.dynamicContent = dynamicContent;
  }

  getContext() {
    return {
      userName: this.userName,
      otp: this.otp,
      dynamicContent: this.dynamicContent,
    };
  }
}

module.exports = ForgotPasswordContext;
