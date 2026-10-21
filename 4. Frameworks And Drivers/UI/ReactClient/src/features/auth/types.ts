export interface UserCredentialsDto {
  email: string;
  password: string;
}

export interface UserRegistrationDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  secondName?: string;
  secondLastName?: string;
}

export interface TokensDto {
  accessToken: string;
}
