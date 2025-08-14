import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';
import { ApiService } from '../services/api.service';

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

  get cartLength(): number {
    return this.cartService.getCart()?.length ?? 0;
  }

  constructor(
    private router: Router,
    public cartService: CartService,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.cargarnovedades();
  }

  cargarnovedades(): void {
    // this.cargandoRubros = true;
    let cliente = localStorage.getItem('loginClientNumber')
    this.api.getNov(cliente).subscribe({
      next: articulos => {
        console.log(articulos);
        this.articulos = articulos;

        /*  this.cargandoMarcas = false; */
      },
      error: err => {
        console.error('Error cargando novedaades', err);
        /* this.cargando = false; */
      }
    });
  }

  agregarAlCarrito(p: any): void {
    this.cartService.add(p);
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  trackByIndex = (i: number) => i;
  trackByProducto = (_: number, p?: any) => p?.id ?? _;

  buscar() {

  }

}

