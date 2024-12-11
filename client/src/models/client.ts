export class Client {
    ClientId?: number;
    Name: string;
    Mobile: string;
    Email: string;
    Address?: string;
    Country?: string;
    Province?: string;
    Locality?: string;
    Observations?: string;

    constructor(
      name: string,
      mobile: string,
      email: string
    ) {
      this.ClientId = 0;
      this.Name = name;
      this.Mobile = mobile;
      this.Email = email;
      this.Address = '';
      this.Country = '';
      this.Province = '';
      this.Locality = '';
      this.Observations = '';
    }
  }