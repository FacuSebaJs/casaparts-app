import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ArticuloService {
    constructor(private http: HttpClient) { }

    getNov(cliente: any): Observable<any[]> {
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

    getUrlImages(codigo: string) {
        let url: string = `${environment.IMAGES_URL}/getFormatImgArticulo/${codigo}`;
        return this.http.get<any[]>(url, { responseType: 'json' }).pipe(
            map(images => {
                return images;
            }),
            catchError((err) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status != 502) {
                        console.error('Error al obtener imagenes', err);
                    }
                }
                else {
                    console.error('Error al obtener imagenes', err);
                }
                return of([]);
            })
        );
    }

    busquedaArticulo(cliente: number | null, busqueda: string): Observable<any[]> {
        return this.http.post<any[]>(`${environment.API_URL}/busqueda/filtro/${cliente}`, { busqueda: busqueda, filtro: "0", lista: null, marca: "", memo: true, modelo: "", rubro: "" }, { responseType: 'json' }).pipe(
            map(articulos => {
                return articulos;
            }),
            catchError(err => {
                console.error('Error al obtener articulos', err);
                return of([]);
            })
        );
    }

    getCoefArt(cliente: number | null, codigo: string): Observable<any> {
        return this.http.get<any>(`${environment.API_URL}/art_coef/getByClientArticle/${cliente}/${codigo}`, { responseType: 'json' }).pipe(
            map(coeficientes => {
                return coeficientes;
            }),
            catchError(err => {
                console.error('Error al obtener coeficientes', err);
                return of([]);
            })
        );
    }

}
