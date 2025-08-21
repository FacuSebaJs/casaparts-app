import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ConfigClienteService {
    constructor(private http: HttpClient) { }

    getConfig(cliente: any): Observable<any> {
        let url: string = `${environment.API_URL}/config_cliente/${cliente}`;
        return this.http.get<any>(url, { responseType: 'json' }).pipe(
            map(config => {
                return config;
            }),
            catchError(err => {
                console.error('Error al obtener configuración de cliente', err);
                return of([]);
            })
        );
    }

    setConfig(cliente: any): Observable<any> {
        let url: string = `${environment.API_URL}/config_cliente/${cliente}`;
        return this.http.patch<any>(url, { responseType: 'json' }).pipe(
            map(response => {
                return response.body;
            }),
            catchError(err => {
                console.error('Error al guardar configuración de cliente', err);
                return of([]);
            })
        );
    }

}
