import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from './cart/cart.service';

import { Router } from '@angular/router';

interface Producto {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  marca: string;
  rubro: string;
  modelo: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedMarca: string = '';
selectedModelo: string = '';
selectedRubro: string = '';

  productos: Producto[] = [
    {
      nombre: 'Resorte Espiral Delantero',
      descripcion: 'Suspensión delantera Renault',
      precio: 5623,
      imagen: 'assets/images/ResorteEspiral.png',
      marca: 'Renault',
      rubro: 'Suspensión',
      modelo: 'Sandero'
    },
    {
      nombre: 'Alternador Renault 70 A',
      descripcion: 'Alternador de 70 amperes para Renault 12',
      precio: 57986,
      imagen: 'assets/images/alternador.png',
      marca: 'Renault',
      rubro: 'Motor',
      modelo: 'Renault 12'
    },
    {
      nombre: 'Pastillas de Freno Delanteras',
      descripcion: 'Juego de pastillas de freno delanteras',
      precio: 16203,
      imagen: 'assets/images/pastillas.png',
      marca: 'Volkswagen',
      rubro: 'Frenos',
      modelo: 'Gol'
    },
    {
      nombre: 'Bieleta',
      descripcion: 'Bieleta de suspensión trasera',
      precio: 4770,
      imagen: 'assets/images/bieleta.png',
      marca: 'Ford',
      rubro: 'Suspensión',
      modelo: 'Focus'
    }
  ];

  filtro = {
    texto: '',
    marca: '',
    rubro: '',
    modelo: ''
  };

  // ✅ Propiedad ofertas para el carrusel
  ofertas = [
    {
      nombre: 'Resorte Espiral',
      precio: 4999,
      imagen: 'assets/images/ResorteEspiral.png'
    },
    {
      nombre: 'Alternador 70A',
      precio: 49900,
      imagen: 'assets/images/alternador.png'
    },
    {
      nombre: 'Pastillas Delanteras',
      precio: 14500,
      imagen: 'assets/images/pastillas.png'
    }
  ];

  constructor(public cartService: CartService, private router: Router) {}

  get productosFiltrados(): Producto[] {
    return this.productos.filter(producto => {
      return (
        producto.nombre.toLowerCase().includes(this.filtro.texto.toLowerCase()) &&
        (this.filtro.marca === '' || producto.marca === this.filtro.marca) &&
        (this.filtro.rubro === '' || producto.rubro === this.filtro.rubro) &&
        (this.filtro.modelo === '' || producto.modelo === this.filtro.modelo)
      );
    });
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  agregarAlCarrito(producto: Producto): void {
    this.cartService.agregarProducto(producto);
  }

  limpiarFiltros() {
  // Resetear filtros (ya implementado)
  this.selectedMarca = '';
  this.selectedModelo = '';
  this.selectedRubro = '';

  // Resetear carrito
  this.cartService.clearCart();
}

}

