import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) { }

  getMarcas(): Observable<{ NOMBRE: string, MARCA: string }[]> {
    return this.http.get<{ NOMBRE: string, MARCA: string }[]>(`${environment.API_URL}/marcas`, { responseType: 'json' }).pipe(
      map(marcas => {

        return marcas;
      }),
      catchError(err => {
        console.error('Error al obtener marcas', err);
        return of([]);
      })
    );
  }
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

  getRubros(): Observable<{ LI: string, TITULO: string }[]> {
    return this.http.get<{ LI: string, TITULO: string }[]>(`${environment.API_URL}/rubros`, { responseType: 'json' }).pipe(
      map(rubros => {
        console.log(rubros);
        return rubros;
      }),
      catchError(err => {
        console.error('Error al obtener rubros', err);
        return of([]);
      })
    );
  }

  getModelos(): Observable<{ CODIGO: string, NOMBRE: string }[]> {
    return this.http.get<{ CODIGO: string, NOMBRE: string }[]>(`${environment.API_URL}/auto`, { responseType: 'json' }).pipe(
      map(modelos => {
        console.log(modelos);
        return modelos;
      }),
      catchError(err => {
        console.error('Error al obtener modelos', err);
        return of([]);
      })
    );
  }

  login(cliente: number | null, Email: string, clave: string): Observable<any[]> {
    return this.http.post<any[]>(`${environment.AUTH_URL}/login`, { codigo: cliente, email: Email, password: clave }, { responseType: 'json' }).pipe(
      map(credenciales => {
        console.log(credenciales);
        return credenciales;
      }),
      catchError(err => {
        console.error('Error al obtener credenciales', err);
        return of([]);
      })
    );
  }

}
