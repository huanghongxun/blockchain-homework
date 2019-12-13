import {Receipt} from './receipt.model';
import {Role} from './role.model';

export interface Availability {
  ok: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  name: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  password: string;
  government: string;
  role: string;
}

export interface RegisterResponse {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface ProfileResponse {
  id: number;
  address: string;
  publicKey: string;
  username: string;
  name: string;
  role: string;
  admin: boolean;
  inBalance?: number;
  outBalance?: number;
  inReceipts?: Receipt[];
  outReceipts?: Receipt[];
}

export interface AuditedUser {
  id: number;
  username: string;
  name: string;
  address: string;
  publicKey: string;
  role: Role;
}

export interface UnauditedUser {
  id: number;
  username: string;
  name: string;
  address: string;
  publicKey: string;
  role: Role;
  audited?: boolean;
}
