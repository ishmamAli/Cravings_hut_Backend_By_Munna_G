class CredentialsContext {
  constructor(firstName, lastName, email, role, password) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.password = password;
  }

  getContext() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      password: this.password,
    };
  }
}

module.exports = CredentialsContext;
