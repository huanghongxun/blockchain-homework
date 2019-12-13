import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PrivateKeyService {

  public lastPrivateKey: string;
  public request = new BehaviorSubject<{ callback: () => void }>(null);

  constructor() { }
}

export class PrivateKeyInterceptor implements HttpInterceptor {

  constructor(private privateKeyService: PrivateKeyService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.privateKeyService.lastPrivateKey) {
      req = req.clone({
        setHeaders: {
          ['Private-Key']: this.privateKeyService.lastPrivateKey
        }
      });
    }

    return next.handle(req);
  }
}
