import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { TokensDto, UserCredentialsDto, UserRegistrationDto } from './types';

export const authService = {
  async login(credentials: UserCredentialsDto): Promise<TokensDto> {
    const response = await apiClient.post<TokensDto>(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async register(data: UserRegistrationDto): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },
};
