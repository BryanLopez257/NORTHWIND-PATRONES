export interface LoginRequestDto {
  email: string;
  password?: string;
}

export interface RegisterRequestDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  secondName?: string;
  secondLastName?: string;
}

export interface UserTokenDto {
  accessToken: string;
}
