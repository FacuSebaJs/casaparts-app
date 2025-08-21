import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) { }

    login(cliente: number | null, Email: string, clave: string): Observable<any[]> {
        return this.http.post<any[]>(`${environment.AUTH_URL}/login`, { codigo: cliente, email: Email, password: clave }, { responseType: 'json' }).pipe(
            map(credenciales => {
                return credenciales;
            }),
            catchError(err => {
                console.error('Error al obtener credenciales', err);
                return of([]);
            })
        );
    }

}