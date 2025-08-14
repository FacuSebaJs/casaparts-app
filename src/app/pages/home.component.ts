import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Estados de carga/error
  cargandoProductos = false;
  errorProductos = '';
  articulos: any[] = [];
  busqueda: string = '';
  imagenes: string[] = [];

  get cartLength(): number {
    return this.cartService.getCart()?.length ?? 0;
  }

  constructor(
    private router: Router,
    public cartService: CartService,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.cargaInicial();
  }

  async cargaInicial() {
    await this.cargarnovedades();
    this.obtenerImagenes(this.articulos);

  }

  async cargarnovedades() {
    try {
      let cliente = localStorage.getItem('loginClientNumber')
      const articulos = await firstValueFrom(this.api.getNov(cliente));
      console.log(articulos);
      this.articulos = articulos;
      return articulos;
    } catch (err) {
      console.error('Error cargando novedades', err);
      throw err;
    }
  }


  agregarAlCarrito(p: any): void {
    this.cartService.add(p);
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  trackByIndex = (i: number) => i;
  trackByProducto = (_: number, p?: any) => p?.id ?? _;

  async buscar() {
    try {
      const cliente = localStorage.getItem('loginClientNumber');
      const articulos = await firstValueFrom(this.api.busquedaArticulo(Number(cliente), this.busqueda));
      console.log(articulos);
      this.obtenerImagenes(articulos);
      this.articulos = articulos;
    } catch (err) {
      console.error('Error cargando busqueda de articulos', err);
      throw err;
    }
  }

  async obtenerImagenes(articulos: any[]) {
    for (let articulo of articulos) {
      let imagenes = await this.obtenerImagen(articulo.CODIGO);
      if (imagenes != null) {
        this.imagenes.push(imagenes.formatos.original);
      }
      else {
        this.imagenes.push('');
      }
    }
    console.log(this.imagenes);
  }

  async obtenerImagen(codigo: string) {
    try {
      const imagenes = await firstValueFrom(this.api.getUrlImages(codigo));
      console.log(imagenes);
      return imagenes[0];
    } catch (err) {
      console.error('Error cargando imagen', err);
      return null;
    }
  }

}

