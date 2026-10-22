import apiClient from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { LoginRequestDto, RegisterRequestDto, UserTokenDto } from './types';

export const authService = {
  async login(dto: LoginRequestDto): Promise<UserTokenDto> {
    const response = await apiClient.post<UserTokenDto>(ENDPOINTS.AUTH.LOGIN, dto);
    return response.data;
  },

  async register(dto: RegisterRequestDto): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.REGISTER, dto);
  },
};
