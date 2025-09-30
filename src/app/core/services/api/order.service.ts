import { HttpClient, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class OrderService {

    private socketOrder = new Subject<void>();
    socketOrder$ = this.socketOrder.asObservable();

    constructor(private http: HttpClient) { }

    refreshOrder(): void {
        this.socketOrder.next();
    }

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
        const prepedido: boolean = true;
        const url = `${environment.API_URL}/pedido/getOrderHeader/${cliente}/1/${prepedido}`;
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
                console.error('Error al obtener pre-pedido', err);
                return of([]);
            })
        );
    }

    getLatestOrders(cliente: any): Observable<any[]> {
        const prepedido: boolean = false;
        const url = `${environment.API_URL}/pedido/getOrderHeader/${cliente}/1/${prepedido}`;
        return this.http.get<any[]>(url).pipe(
            map((orders: any) => {
                return orders || [];
            }),
            catchError(err => {
                console.error('Error al obtener últimos pedidos', err);
                return of([]);
            })
        );
    }

    getAllOrders(cliente: any): Observable<any[]> {
        const prepedido: boolean = false;
        const url = `${environment.API_URL}/pedido/getOrderFilter/${cliente}`;
        return this.http.get<any[]>(url).pipe(
            map((orders: any) => {
                return orders || [];
            }),
            catchError(err => {
                console.error('Error al obtener todos los pedidos', err);
                return of([]);
            })
        );
    }

    deleteArt(cliente: any, id: number): Observable<any> {
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

    sendOrder(id: number, nota: string | null = null): Observable<any> {
        const url = `${environment.API_URL}/pedido/setStatus/${id}`;
        return this.http.patch<any>(url, { estado: 1, nota: nota }, { responseType: 'json' }).pipe(
            map((order: any) => {
                return order;
            }),
            catchError(err => {
                console.error(`Error al obtener el pedido ${id}`, err);
                return of();
            })
        );
    }

    newDetail(pedido: any, detalle: any): Observable<any> {
        const url = `${environment.API_URL}/pedido_detalle/newDetail`;
        return this.http.post<any>(url, { pedido: pedido, detalle: detalle }, { responseType: 'json' }).pipe(
            map((order: any) => {
                return order;
            }),
            catchError(err => {
                console.error(`Error al agregar artículo al pedido`, err);
                return of();
            })
        );
    }

    getOne(id: number): Observable<any> {
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