class BuildingPublishContext {
  constructor(firstName, buildingName, buildingAddress, acceptUrl, declineUrl) {
    this.firstName = firstName;
    this.buildingName = buildingName;
    this.buildingAddress = buildingAddress;
    this.acceptUrl = acceptUrl;
    this.declineUrl = declineUrl;
  }

  getContext() {
    return {
      firstName: this.firstName,
      buildingName: this.buildingName,
      buildingAddress: this.buildingAddress,
      acceptUrl: this.acceptUrl,
      declineUrl: this.declineUrl,
    };
  }
}

module.exports = BuildingPublishContext;
