import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ConfigClienteService {
    constructor(private http: HttpClient) { }

    getConfigCliente(cliente: any): Observable<any[]> {
        let url: string = `${environment.API_URL}/busqueda/nov-off/${cliente}`;

        return this.http.get<any>(url, { responseType: 'json' }).pipe(
            map(articulos => {

                return articulos;
            }),
            catchError(err => {
                console.error('Error al obtener articulos', err);
                return of([]);
            })
        );
    }

}
