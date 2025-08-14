import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MarcaApi { MARCA: string; NOMBRE: string; }
export interface ProductoApi {
  ID?: string | number;
  NOMBRE?: string;
  DESCRIPCION?: string;
  PRECIO?: number | string;
  IMAGEN?: string;
  MARCA?: string;
  RUBRO?: string;
  MODELO?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Obtiene las marcas desde el backend y las devuelve como lista de strings.
   */
  getMarcas(): Observable<{NOMBRE: string, MARCA: string}[]> {
    return this.http.get<{NOMBRE: string, MARCA: string}[]>(`${environment.API_URL}/marcas`, { responseType: 'json' }).pipe(
      map(marcas => {
      
        return marcas;
      }),
      catchError(err => {
        console.error('Error al obtener marcas', err);
        return of([]);
      })
    );
  }
  getNov(cliente:any): Observable<any[]> {
    let url: string=`${environment.API_URL}/busqueda/nov-off/${cliente}`;

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


   getRubros(): Observable<{LI:string, TITULO: string}[]> {
    return this.http.get<{LI:string, TITULO: string}[]>(`${environment.API_URL}/rubros`, { responseType: 'json' }).pipe(
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

  getModelos(): Observable<{CODIGO: string, NOMBRE: string}[]> {
    return this.http.get<{CODIGO: string, NOMBRE: string}[]>(`${environment.API_URL}/auto`, { responseType: 'json' }).pipe(
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

  login(cliente:number| null,Email:string,clave:string): Observable<any[]> {
    return this.http.post<any[]>(`${environment.AUTH_URL}/login`,{codigo:cliente,email:Email,password:clave}, { responseType: 'json' }).pipe(
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

  
  getProductosPorMarca(marca: string): Observable<ProductoApi[]> {
    const url = `/back/productos?marca=${encodeURIComponent(marca)}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(txt => {
        const start = txt.indexOf('[');
        const arr = JSON.parse(start >= 0 ? txt.slice(start) : txt) as ProductoApi[];
        return arr;
      }),
      catchError(err => {
        console.warn(`No se pudo obtener productos para ${marca}, usando datos de demo`, err);
        const fake: ProductoApi[] = [
          {
            ID: `demo-${marca}-1`,
            NOMBRE: `Kit freno ${marca}`,
            DESCRIPCION: `Juego delantero ${marca}`,
            PRECIO: 25999,
            IMAGEN: 'assets/images/pastillas.png',
            MARCA: marca, RUBRO: 'Frenos', MODELO: 'Genérico'
          },
          {
            ID: `demo-${marca}-2`,
            NOMBRE: `Bieleta ${marca}`,
            DESCRIPCION: `Suspensión / ${marca}`,
            PRECIO: 18999,
            IMAGEN: 'assets/images/bieleta.png',
            MARCA: marca, RUBRO: 'Suspensión', MODELO: 'Genérico'
          },
          {
            ID: `demo-${marca}-3`,
            NOMBRE: `Filtro de aire ${marca}`,
            DESCRIPCION: `Motor / ${marca}`,
            PRECIO: 9999,
            IMAGEN: 'assets/images/filtro_aire.png',
            MARCA: marca, RUBRO: 'Motor', MODELO: 'Genérico'
          }
        ];
        return of(fake);
      })
    );
  }
}
