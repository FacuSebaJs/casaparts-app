import { Component, OnInit, computed, signal, AfterViewInit, ElementRef, ViewChild, } from '@angular/core';
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
export class HomeComponent implements OnInit {
  @ViewChild('carouselOfertas', { static: false }) carouselElement!: ElementRef;
  carouselInstance: any;
  // Estados de carga/error
  cargandoProductos = false;
  errorProductos = '';
  articulos: any[] = [];
  busqueda: string = '';
  imagenes: string[] = [];
  spinner: boolean = false;
  private cancelador$ = new Subject<void>();


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

  ngAfterViewInit(): void {
    this.initCarrusel();
    const carouselEl = document.getElementById('carouselOfertas');
    carouselEl?.addEventListener('slid.bs.carousel', () => {
      const activeSlide = carouselEl.querySelector('.carousel-item.active');
      const allSlides = Array.from(carouselEl.querySelectorAll('.carousel-item'));
      const currentIndex = allSlides.indexOf(activeSlide as Element);
      console.log('Slide cambiado. Índice actual:', currentIndex);
    });
  }

  initCarrusel() {
    if (this.carouselInstance) {
      this.carouselInstance.dispose(); // Destruye instancia anterior si existe
    }
    else {
      setTimeout(() => {
        const el = this.carouselElement?.nativeElement;
        if (el) {
          const carouselInstance = new bootstrap.Carousel(el);
          el.addEventListener('slid.bs.carousel', async () => {
            const activeItem = el.querySelector('.carousel-item.active');
            const items = Array.from(el.querySelectorAll('.carousel-item'));
            const currentIndex = items.indexOf(activeItem as Element);
            console.log('Índice actual:', currentIndex);
            if (this.articulos[currentIndex]&& this.imagenes[currentIndex]=='') {
              const resp = await this.obtenerImagen(currentIndex);
              console.log(resp)
              this.imagenes[currentIndex] = resp?.formatos?.original ?? resp;
            }
          });
        } else {
          console.error('Carrusel no disponible en el DOM');
        }
      });
    }
  }

  async cargaInicial() {
    //await this.cargarnovedades();
    //this.obtenerImagenes(this.articulos);

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
      this.spinner = true;
      this.pausarCarrusel();
      //mostrar spinner
      const cliente = localStorage.getItem('loginClientNumber');
      const articulos = await firstValueFrom(this.api.busquedaArticulo(Number(cliente), this.busqueda));
      console.log(articulos);
      await this.obtenerImagenes(articulos);
      this.reanudarCarrusel();
      //quitar spinner
      this.articulos = articulos;
    } catch (err) {
      console.error('Error cargando busqueda de articulos', err);
      throw err;
    }
    finally {
      this.spinner = false;
    }
  }

  /* async obtenerImagenes(articulos: any[]) {
    this.imagenes = Array(articulos.length).fill(null);
    for (let i = 0; i < articulos.length; i++) {
      //let imagenes = await this.obtenerImagen(articulo.CODIGO);
      this.obtenerImagen(articulos[i].CODIGO).then(imagenes => {
        if (imagenes != null) {
          this.imagenes.push('');
          //this.imagenes.push(imagenes.formatos.original);
        }
        else {
          this.imagenes.push('');
        }
      })
    }
  } */
  async obtenerImagenes(articulos: any[]) {
    this.articulos = [];
    this.imagenes = Array(articulos.length).fill("");
    this.cancelador$.next();
    setTimeout(() => this.initCarrusel()); // espera que el DOM se actualice
  }

  /* async obtenerImagen(codigo: string) {
    try {
      const imagenes = await firstValueFrom(this.api.getUrlImages(codigo));
      console.log(imagenes);
      return imagenes[0];
    } catch (err) {
      console.error('Error cargando imagen', err);
      return null;
    }
  } */
  async obtenerImagen(index: number) {

    try {
      console.log(this.articulos)
      const imagenes = await this.api.getUrlImages(this.articulos[index].CODIGO)
        .pipe(takeUntil(this.cancelador$))
        .toPromise();

      //console.log(imagenes);
      if (imagenes && imagenes.length > 0) {

        return imagenes[0];

      } else {

        return null; // o un objeto vacío, si prefieres

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
  onSlide(event: any) {
    console.log(event.current);
  }


}

