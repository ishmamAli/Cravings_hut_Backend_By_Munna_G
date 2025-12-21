class AdminCreatedContext {
  constructor(firstName, lastName, email, role, password, createdByEmail, buildingName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.password = password;
    this.createdByEmail = createdByEmail;
    this.buildingName = buildingName;
  }

  getContext() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      password: this.password,
      createdByEmail: this.createdByEmail,
      buildingName: this.buildingName,
    };
  }
}

module.exports = AdminCreatedContext;
