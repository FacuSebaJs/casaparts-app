import { HttpClient, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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

    getBuy(cliente: any): Observable<any[]> {
        const url = `${environment.API_URL}/pedido/getOrderHeader/${cliente}/1`;
        return this.http.get<any[]>(url).pipe(
            switchMap(orderHeader => {
                if (orderHeader && orderHeader.length) {
                    return this.getOne(orderHeader[0].id).pipe(
                        map((order: any) => {
                            return order?.detalle || [];
                        })
                    );
                } else {
                    return of([]);
                }
            }),
            catchError(err => {
                console.error('Error al obtener cantidad de artículos', err);
                return of([]);
            })
        );
    }

    public deleteArt(cliente: any, id: number): Observable<any> {
        const url = `${environment.API_URL}/pedido_detalle/${id}`;
        return this.http.delete<any>(url, { responseType: 'json', headers: { cliente: cliente } }).pipe(
            map(resp => {
                return resp;
            }),
            catchError(err => {
                console.error('Error al obtener íconos de compra', err);
                return of(null);
            })
        );
    }

    private getOne(id: number): Observable<any> {
        let url: string = `${environment.API_URL}/pedido/getOne/${id}`;
        return this.http.get<any>(url, { responseType: 'json' }).pipe(
            map((order: any) => {
                return order;
            }),
            catchError(err => {
                console.error(`Error al obtener el pedido ${id}`, err);
                return of();
            })
        );
    }

}