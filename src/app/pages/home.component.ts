import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';
import { ApiService } from '../services/api.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('carouselOfertas', { static: false }) carouselElement!: ElementRef;
  carouselInstance: any;
  cargandoProductos = false;
  errorProductos = '';
  articulos: any[] = [];
  busqueda: string = '';
  imagenes: string[] = [];
  spinner: boolean = false;
  private cancelador$ = new Subject<void>();

  constructor(
    private router: Router,
    public cartService: CartService,
    private api: ApiService
  ) { }
  
  get cartLength(): number {
    return this.cartService.getCart()?.length ?? 0;
  }

  ngOnInit(): void {
    this.cargaInicial();
  }

  ngAfterViewInit(): void {
    this.initCarrusel();
    const carouselEl = document.getElementById('carouselOfertas');
    carouselEl?.addEventListener('slid.bs.carousel', () => {
      const activeSlide = carouselEl.querySelector('.carousel-item.active');
      const allSlides = Array.from(carouselEl.querySelectorAll('.carousel-item'));
      const currentIndex = allSlides.indexOf(activeSlide as Element);
    });
  }

  initCarrusel() {
    if (this.carouselInstance) {
      this.carouselInstance.dispose();
    } else {
      setTimeout(() => {
        const el = this.carouselElement?.nativeElement;
        if (el) {
          const carouselInstance = new bootstrap.Carousel(el);
          el.addEventListener('slid.bs.carousel', async () => {
            const activeItem = el.querySelector('.carousel-item.active');
            const items = Array.from(el.querySelectorAll('.carousel-item'));
            const currentIndex = items.indexOf(activeItem as Element);
            console.log('Índice actual:', currentIndex);
            if (this.articulos[currentIndex] && this.imagenes[currentIndex] == '') {
              const resp = await this.obtenerImagen(currentIndex);
              this.imagenes[currentIndex] = resp?.formatos?.original ?? resp;
            }
          });
        } else {
          setTimeout(() => {
            this.initCarrusel();
          }, 1000);
          console.error('Carrusel no disponible en el DOM');
        }
      });
    }
  }

  async cargaInicial() {
    await this.cargarnovedades();
  }

  async cargarnovedades() {
    try {
      let cliente = localStorage.getItem('loginClientNumber');
      const articulos = await firstValueFrom(this.api.getNov(cliente));
      await this.obtenerImagenes(articulos);
      this.articulos = articulos;
      return articulos;
    } catch (err) {
      console.error('Error cargando novedades', err);
      throw err;
    }
  }

  // === NUEVO: agregar al carrito con mapeo seguro ===
  agregarAlCarrito(p: any): void {
    const item = this.mapProductoAItem(p);
    this.cartService.add(item);
  }

  private mapProductoAItem(p: any) {
    // Intentamos cubrir tus posibles campos (DESCRIP, CODIGO, MARCA, PRECIO, etc.)
    const precioPosibles = [
      p.PRECIO, p.precio, p.PRECIO_LISTA, p.PRECIOFINAL, p.price
    ].map((x: any) => Number(x)).find((n: number) => !isNaN(n));
    return {
      id: p.id ?? p.CODIGO ?? p.codigo ?? p.sku ?? p.DESCRIP ?? p.nombre,
      nombre: p.DESCRIP ?? p.nombre ?? p.titulo ?? 'Producto',
      precio: precioPosibles ?? 0,
      imagen: p.imagen ?? p.imageUrl ?? p.foto ?? null,
      marca: p.MARCA ?? p.marca ?? p.brand ?? null,
      codigo: p.CODIGO ?? p.codigo ?? p.sku ?? null,
      cantidad: 1
    };
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  trackByIndex = (i: number) => i;
  trackByProducto = (_: number, p?: any) => p?.id ?? _;

  async buscar() {
    try {
      this.spinner = true;
      this.pausarCarrusel();
      const cliente = localStorage.getItem('loginClientNumber');
      const articulos = await firstValueFrom(this.api.busquedaArticulo(Number(cliente), this.busqueda));
      await this.obtenerImagenes(articulos);
      this.reanudarCarrusel();
      this.articulos = articulos;
    } catch (err) {
      console.error('Error cargando busqueda de articulos', err);
      throw err;
    }
    finally {
      this.spinner = false;
    }
  }

  async obtenerImagenes(articulos: any[]) {
    this.articulos = [];
    this.imagenes = Array(articulos.length).fill("");
    this.cancelador$.next();
    setTimeout(() => this.initCarrusel()); // espera que el DOM se actualice
  }

  async obtenerImagen(index: number) {
    try {
      const imagenes = await this.api.getUrlImages(this.articulos[index].CODIGO)
        .pipe(takeUntil(this.cancelador$))
        .toPromise();
      if (imagenes && imagenes.length > 0) {
        return imagenes[0];
      } else {
        return null;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'CanceledError') {
        console.log('Petición cancelada');
      } else {
        console.error('Error cargando imagen', err);
      }
      return null;
    }
  }

  pausarCarrusel() {
    if (this.carouselInstance) {
      this.carouselInstance.pause();
    }
  }

  reanudarCarrusel() {
    if (this.carouselInstance) {
      this.carouselInstance.cycle();
    }
  }
}
