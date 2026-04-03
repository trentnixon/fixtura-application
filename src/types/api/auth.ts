import type { User } from "../entities/user";

export interface LoginRequest {
  identifier: string;
  password?: string; // Optional if we move to link-based, but standard for now
}

export interface LoginResponse {
  user: User;
}

export interface CurrentUserResponse {
  user: User;
}

export interface NavUserProps {
  name: string;
  email: string;
  avatar: string;
}
