import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../order/cart.service';
import { firstValueFrom, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('carouselOfertas', { static: false }) carouselElement!: ElementRef;
  carouselInstance: any;
  cargandoProductos = false;
  errorProductos = '';
  articulos: any[] = [];
  busqueda: string = '';
  imagenes: string[] = [];
  spinner: boolean = false;
  configCliente: { general: number, contado: number, tarjeta: number, descuento: number } = { general: 0, contado: 0, tarjeta: 0, descuento: 0 };
  precios: { costo: number | null, venta: number | null, contado: number | null, tarjeta: number | null }[] = [];
  private cancelador$ = new Subject<void>();

  constructor(
    private router: Router,
    public cartService: CartService,
    private _articuloService: ArticuloService,
    private _configClienteService: ConfigClienteService
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
    }
    else {
      setTimeout(() => {
        const el = this.carouselElement?.nativeElement;
        if (el) {
          el.addEventListener('slid.bs.carousel', async () => {
            const activeItem = el.querySelector('.carousel-item.active');
            const items = Array.from(el.querySelectorAll('.carousel-item'));
            const currentIndex = items.indexOf(activeItem as Element);
            this.actualizarDatos(currentIndex);

          });
        } else {
          setTimeout(() => {
            this.initCarrusel();
          }, 5000)
          console.error('Carrusel no disponible en el DOM');
        }
      });
    }
  }

  async actualizarDatos(currentIndex: number) {
    if (this.articulos[currentIndex]) {
      if (this.imagenes[currentIndex] == '') {
        const resp = await this.obtenerImagen(currentIndex);
        this.imagenes[currentIndex] = resp?.formatos?.original ?? resp;
      }
      if (this.precios[currentIndex] == null || this.precios[currentIndex].costo == null) {
        const precios = await this.calcularPrecio(this.articulos[currentIndex]);
        this.precios[currentIndex] = precios;
      }
    }
  }

  async cargaInicial() {
    await this.cargarConfigCliente();
    await this.cargarnovedades();
    await this.actualizarDatos(0);
  }

  agregarAlCarrito(p: any): void {
    this.cartService.add(p);
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  trackByIndex = (i: number) => i;
  trackByProducto = (_: number, p?: any) => p?.id ?? _;

  async cargarDatosVacios(articulos: any[]) {
    this.articulos = [];
    this.imagenes = Array(articulos.length).fill("");
    this.precios = Array(articulos.length).fill({ costo: null, venta: null, contado: null, tarjeta: null });
    this.cancelador$.next();
    setTimeout(() => this.initCarrusel());
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

  async obtenerImagen(index: number) {
    try {
      const imagenes = await lastValueFrom(this._articuloService.getUrlImages(this.articulos[index].CODIGO)
        .pipe(takeUntil(this.cancelador$)))
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

  async buscar() {
    try {
      this.spinner = true;
      this.pausarCarrusel();
      const cliente = localStorage.getItem('loginClientNumber');
      const articulos = await firstValueFrom(this._articuloService.busquedaArticulo(Number(cliente), this.busqueda));
      await this.cargarDatosVacios(articulos);
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

  async cargarnovedades() {
    try {
      let cliente = localStorage.getItem('loginClientNumber')
      const articulos = await firstValueFrom(this._articuloService.getNov(cliente));
      await this.cargarDatosVacios(articulos);
      this.articulos = articulos;
      return articulos;
    } catch (err) {
      console.error('Error cargando novedades', err);
      throw err;
    }
  }

  async cargarConfigCliente() {
    try {
      let cliente = localStorage.getItem('loginClientNumber')
      const configCliente = await firstValueFrom(this._configClienteService.getConfig(cliente));
      this.configCliente = configCliente;
    } catch (err) {
      console.error('Error cargando configuración de cliente', err);
      throw err;
    }
  }

  async calcularPrecio(articulo: any) {
    try {
      let cliente = localStorage.getItem('loginClientNumber')
      const coeficientes = await firstValueFrom(this._articuloService.getCoefArt(Number(cliente), articulo.CODIGO));
      let precio = { costo: 0, venta: 0, contado: 0, tarjeta: 0 };
      precio.costo = this.twoDecimal(this.twoDecimal(articulo.PRECIO) - this.twoDecimal(articulo.PRECIO * this.configCliente.descuento / 100));
      precio.venta = this.twoDecimal(this.twoDecimal(precio.costo) + this.twoDecimal((precio.costo * (coeficientes && coeficientes.Coef ? coeficientes.Coef : this.configCliente.general) / 100).toFixed(2)));
      precio.contado = this.twoDecimal(this.twoDecimal(precio.venta) + this.twoDecimal(precio.venta * this.configCliente.contado / 100));
      precio.tarjeta = this.twoDecimal(this.twoDecimal(precio.venta) + this.twoDecimal(precio.venta * this.configCliente.tarjeta / 100));
      if (articulo.DTO) {
        precio.costo = this.twoDecimal(this.twoDecimal(precio.costo) - this.twoDecimal(precio.costo * articulo.DTO / 100));
        precio.venta = this.twoDecimal(this.twoDecimal(precio.venta) - this.twoDecimal(precio.venta * articulo.DTO / 100));
        precio.contado = this.twoDecimal(this.twoDecimal(precio.contado) - this.twoDecimal(precio.contado * articulo.DTO / 100));
        precio.tarjeta = this.twoDecimal(this.twoDecimal(precio.tarjeta) - this.twoDecimal(precio.tarjeta * articulo.DTO / 100));
      }
      return precio;
    } catch (err) {
      console.error('Error cargando configuración de cliente', err);
      throw err;
    }
  }

  private twoDecimal(value: any) {
    return Number(Number(value).toFixed(2));
  }

}

