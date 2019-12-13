import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import {UserService} from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.userService.user;
    if (user) {
      // check if route is restricted by role
      if (user.role !== 'ROLE_ADMIN' && (!route.data.roles || route.data.roles.indexOf(user.role) === -1)) {
        // role not authorised so redirect to home page
        this.router.navigate(['/']);
        return false;
      }

      // authorised so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/user/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
