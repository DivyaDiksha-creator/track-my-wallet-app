export interface LoginResponse {
  userId: number; // Corresponds to UserId in your backend LoginResponseDto
  email: string;  // Corresponds to Email in your backend LoginResponseDto
  token: string;  // Corresponds to Token in your backend LoginResponseDto
  username: string; // Corresponds to Username in your backend LoginResponseDto
  }