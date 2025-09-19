import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) { }

    login(cliente: number | null, email: string, clave: string): Observable<any> {
        return this.http.post<any>(`${environment.AUTH_URL}/login`, { codigo: cliente, email: email, password: clave }, { responseType: 'json' }).pipe(
            map(credenciales => {
                return credenciales;
            }),
            catchError(err => {
                console.error('Error al obtener credenciales', err);
                return of([]);
            })
        );
    }

    refreshLogin(cliente: number | null, email: string, logeado: boolean = true): Observable<{ token: string }> {
        return this.http.put<{ token: string }>(`${environment.AUTH_URL}/usuarios/refreshLogin`, { email: email, codigo: cliente, logeado: logeado }, { responseType: 'json' }).pipe(
            map(token => {
                return token;
            }),
            catchError(err => {
                console.error('Error al obtener token', err);
                return of({ token: 'development' });
            })
        );
    }

}