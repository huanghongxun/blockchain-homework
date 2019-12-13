import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class JwtService implements HttpInterceptor {

  constructor(private userService: UserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.userService.user;
    if (user && user.accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `${user.tokenType} ${user.accessToken}`
        }
      });
    }

    return next.handle(req);
  }
}
