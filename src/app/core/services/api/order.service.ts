import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class OrderService {
    constructor(private http: HttpClient) { }

    getBuyIcon(cliente: any): Observable<{
        preOrder: any[],
        order: any[]
    }> {
        let url: string = `${environment.API_URL}/pedido/getBuyIcon/${cliente}`;
        return this.http.get<any>(url, { responseType: 'json' }).pipe(
            map(orders => {
                return orders;
            }),
            catchError(err => {
                console.error('Error al obtener íconos de compra', err);
                return of();
            })
        );
    }

}