import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {
  Availability, LoginRequest,
  LoginResponse,
  ProfileResponse, UnauditedUser, AuditedUser, RegisterRequest, RegisterResponse
} from '../models/user.model';
import {Role, RoleComparator} from '../models/role.model';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUserSubject: BehaviorSubject<LoginResponse>;

  constructor(private api: ApiService) {
    this.currentUserSubject = new BehaviorSubject<LoginResponse>(JSON.parse(localStorage.getItem('currentUser')));
  }

  public get user() {
    return this.currentUserSubject.value;
  }

  public is(role: string) {
    return this.user && this.user.role === role;
  }

  public userSubject() {
    return this.currentUserSubject;
  }

  public login(loginRequest: LoginRequest) {
    return this.api.post<LoginResponse>(`/user/login`, loginRequest)
      .then(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      });
  }

  public logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    return this.api.get(`/user/logout`);
  }

  public register(registerRequest: RegisterRequest) {
    return this.api.post<RegisterResponse>(`/user/register`, registerRequest);
  }

  public validate(type: 'username' | 'name' | 'publicKey', value: string) {
    return this.api.get<Availability>(`/user/checkAvailability`, {
      params: {
        [type]: value
      }
    });
  }

  public getUserProfile(userId: string | number = 'profile') {
    return this.api.get<ProfileResponse>(`/user/${userId}`);
  }

  public getAddressProfile(address: string) {
    return this.api.get<ProfileResponse>(`/address/${address}`);
  }

  public acceptUser(userId: number) {
    return this.api.get(`/user/${userId}/audit`);
  }

  public rejectUser(userId: number) {
    return this.api.delete(`/user/${userId}/audit`);
  }

  public getAccounts(role: 'company' | 'government' | 'bank') {
    return this.api.get<ProfileResponse[]>(`/user/${role}`);
  }

  public getUnauditedUsers() {
    return this.api.get<UnauditedUser[]>(`/user/audit-list`);
  }

  public getAuditedUsers() {
    return this.api.get<AuditedUser[]>(`/user/audited-list`);
  }

  public isAuthorized(allowedRules: string[], comparator: RoleComparator) {
    if (!this.user) {
      return allowedRules.indexOf(Role.Anonymous) >= 0;
    }

    if (this.is(Role.Admin)) {
      return true;
    }

    for (const allowedRule in allowedRules) {
      if (comparator(allowedRule, this.user.role)) {
        return true;
      }
    }

    return false;
  }
}
