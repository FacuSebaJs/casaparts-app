import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _sessionService: SessionService){

  }

  private exceptions: string[] = ['login', 'auth', 'register', 'socket', 'casaparts'];

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const isException = this.exceptions.some(exception => request.url.includes(exception));
    if (isException) {
      return next.handle(request);
    }
    const token = this._sessionService.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const clonedRequest = request.clone({
        headers: headers
      });
      return next.handle(clonedRequest);
    }
    return next.handle(request);
  }

}
