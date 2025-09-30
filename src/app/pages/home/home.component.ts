import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of, Subject, Subscription, takeUntil } from 'rxjs';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { SocketService } from '../../core/services/socket.service';
import { OrderService } from '../../core/services/api/order.service';
import { SessionService } from '../../core/services/session.service';
import { ToastrService } from 'ngx-toastr';
import { Carousel } from 'bootstrap';
import { ConfigClient } from '../../models/configClient.model';
import { ImageFormats } from '../../models/image.model';
import { ArticleItem } from '../../models/articulo.model';


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('carouselOfertas', { static: false }) carouselElement!: ElementRef;
  carouselInstance?: Carousel;
  carouselTime: number = 5000;
  cargandoProductos: boolean = false;
  errorProductos: string = '';
  articulos: ArticleItem[] = [];
  busqueda: string = '';
  imagenes: any[] = [];
  spinner: boolean = false;
  configCliente: ConfigClient = { general: null, contado: null, tarjeta: null, descuento: null };
  precios: any[] = [];
  indexImagen: number = 0;
  cancelador$ = new Subject<void>();
  unsubscribe$ = new Subject<void>();
  obsChangedOrderDetail = new Subscription();
  cliente: any = null;
  articulosCarrito: number = 0;
  selectedArt: any = null;
  slideListener: EventListener | null = null;
  openModalOrderedQuantity = new Subject<void>();
  showCost: boolean = false;
  timeoutHandler: any = null;

  constructor(private router: Router, private _articuloService: ArticuloService, private _configClienteService: ConfigClienteService, private _socketService: SocketService, private _orderService: OrderService, private _sessionService: SessionService, private _toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.cargaInicial();
  }

  ngOnDestroy(): void {
    this.removeListener();
    this.removeSockets();
  }

  ngAfterViewInit(): void {
    this.initCarrusel();
  }

  initCarrusel(): void {
    this.removeListener();
    if (this.carouselInstance) {
      this.carouselInstance.dispose();
    }
    setTimeout(() => {
      const el = this.carouselElement?.nativeElement;
      if (el) {
        this.carouselInstance = new Carousel(el, {
          interval: false,
          ride: false,
          pause: false,
        });
        this.slideListener = async () => {
          this.pausarCarrusel();
          const activeItem = el.querySelector('.carousel-item.active');
          const items = Array.from(el.querySelectorAll('.carousel-item'));
          const currentIndex = items.indexOf(activeItem as Element);
          this.indexImagen = currentIndex;
          this.spinner = true;
          await this.actualizarDatos(currentIndex);
          this.spinner = false;
        };
        el.addEventListener('slid.bs.carousel', this.slideListener);
      }
    });
  }

  advanceSlideManually() {
    if (!this.spinner && this.carouselInstance) {
      this.carouselInstance.next();
    }
  }

  programarAvance() {
    this.cleanTimeoutHandler();
    this.timeoutHandler = setTimeout(() => {
      this.advanceSlideManually();
    }, this.carouselTime);
  }

  cleanTimeoutHandler() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }
  }

  removeListener(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    const el = this.carouselElement?.nativeElement;
    if (el && this.slideListener) {
      el.removeEventListener('slid.bs.carousel', this.slideListener);
      this.slideListener = null;
    }
  }

  async actualizarDatos(currentIndex: number) {
    if (this.articulos[currentIndex]) {
      this.spinner = true;
      const promesas = [];
      if (this.imagenes[currentIndex] == '') {
        promesas.push(
          this.obtenerImagen(currentIndex).then(resp => {
            this.imagenes[currentIndex] = resp?.formatos?.original ?? resp;
          })
        );
      }
      if (this.precios[currentIndex] == null || this.precios[currentIndex].costo == null) {
        promesas.push(
          this.calcularPrecio(this.articulos[currentIndex]).then(precios => {
            this.precios[currentIndex] = precios;
          })
        );
      }
      await Promise.all(promesas);
      this.spinner = false;
      this.programarAvance()
    }
  }

  async cargaInicial(): Promise<void> {
    this.cliente = this._sessionService.getClient();
    this.spinner = true;
    await this.cargarConfigCliente();
    await this.cargarnovedades();
    this.spinner = false;
    this.initSocket();
  }

  agregarAlCarrito(item: ArticleItem): void {
    this.pausarCarrusel();
    this.selectedArt = item;
    this.openModalOrderedQuantity.next();
  }

  irAlCarrito(): void {
    this.router.navigate(['/order']);
  }

  irAlHistorial(): void {
    this.router.navigate(['/orderHistory']);
  }

  trackByIndex = (i: number) => i;

  async cargarDatosVacios(articulos: any[]) {
    this.articulos = [];
    this.imagenes = Array(articulos.length).fill("");
    this.precios = Array(articulos.length).fill({ costo: null, venta: null, contado: null, tarjeta: null });
    this.cancelador$.next();
  }

  pausarCarrusel(): void {
    if (this.carouselInstance) {
      this.cleanTimeoutHandler();
      this.carouselInstance.pause();
    }
    else {
      console.warn("No existe instancia del carrusel");
    }
  }

  reanudarCarrusel(): void {
    if (this.carouselInstance) {
      this.carouselInstance.cycle();
    }
    else {
      console.warn("No existe instancia del carrusel");
    }
  }

  async obtenerImagen(index: number): Promise<ImageFormats | null> {
    try {
      const imagenes = await firstValueFrom(
        this._articuloService.getUrlImages(this.articulos[index].CODIGO).pipe(
          takeUntil(this.cancelador$),
          catchError(() => {
            return of(null);
          })
        )
      );
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

  async buscar(): Promise<void> {
    if (!this.spinner) {
      this.pausarCarrusel();
      if (this.busqueda == '') {
        await this.cargarnovedades();
      }
      else {
        if (this.busqueda.length > 3) {
          await this.filtrar();
        }
        else {
          this._toastrService.warning('Debe ingresar más de 3 caracteres', 'Atención');
          this.programarAvance();
        }
      }
    }
  }

  async filtrar(): Promise<void> {
    try {
      this.spinner = true;
      this.indexImagen = 0;
      this.imagenes[this.indexImagen] = '';
      this.precios[this.indexImagen] = null;
      const articulos = await firstValueFrom(this._articuloService.busquedaArticulo(Number(this.cliente), this.busqueda));
      await this.cargarDatosVacios(articulos);
      this.articulos = articulos;
      await this.refreshIcon();
      await this.actualizarDatos(0);
    } catch (err) {
      console.error('Error cargando busqueda de articulos', err);
      throw err;
    }
    finally {
      this.spinner = false;
    }
  }

  async cargarnovedades(): Promise<void> {
    try {
      const articulos = await firstValueFrom(this._articuloService.getNov(Number(this.cliente)));
      await this.cargarDatosVacios(articulos);
      this.articulos = articulos;
      await this.refreshIcon();
      this.indexImagen = 0;
      await this.actualizarDatos(0);
    } catch (err) {
      console.error('Error cargando novedades', err);
      throw err;
    }
  }

  async cargarConfigCliente(): Promise<void> {
    try {
      const configCliente = await firstValueFrom(this._configClienteService.getConfig(Number(this.cliente)));
      this.configCliente = configCliente;
    } catch (err) {
      console.error('Error cargando configuración de cliente', err);
      throw err;
    }
  }

  async calcularPrecio(articulo: any) {
    try {
      const coeficientes = await firstValueFrom(this._articuloService.getCoefArt(Number(this.cliente), articulo.CODIGO));
      let precio = { costo: 0, venta: 0, contado: 0, tarjeta: 0 };
      precio.costo = this.twoDecimal(this.twoDecimal(articulo.PRECIO) - this.twoDecimal(articulo.PRECIO * Number(this.configCliente.descuento) / 100));
      precio.venta = this.twoDecimal(this.twoDecimal(precio.costo) + this.twoDecimal((precio.costo * (coeficientes && coeficientes.Coef ? coeficientes.Coef : this.configCliente.general) / 100).toFixed(2)));
      precio.contado = this.twoDecimal(this.twoDecimal(precio.venta) + this.twoDecimal(precio.venta * Number(this.configCliente.contado) / 100));
      precio.tarjeta = this.twoDecimal(this.twoDecimal(precio.venta) + this.twoDecimal(precio.venta * Number(this.configCliente.tarjeta) / 100));
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

  toggleShowCost(): void {
    this.showCost = !this.showCost;
  }

  private twoDecimal(value: any) {
    return Number(Number(value).toFixed(2));
  }

  private initSocket(): void {
    if (this.obsChangedOrderDetail) {
      this.obsChangedOrderDetail.unsubscribe();
    }
    this.obsChangedOrderDetail = this._orderService.socketOrder$.subscribe(() => {
      this.refreshIcon();
    })
  }

  removeSockets(): void {
    if (this.obsChangedOrderDetail) {
      this.obsChangedOrderDetail.unsubscribe();
    }
  }

  async refreshIcon(): Promise<void> {
    const articulos = await firstValueFrom(this._orderService.getBuyIcon(this.cliente));
    if (this.articulos) {
      let data = JSON.stringify(this.articulos);
      if (data) {
        data = data.replace(/"historial":/g, '"estado": null, "historial":');
      }
      let arts = JSON.parse(data);
      if (articulos && articulos && this.articulos) {
        for (let i of articulos.preOrder) {
          for (let j = 0; j < this.articulos.length; j++) {
            if (i.id_articulo == this.articulos[j].CODIGO) {
              arts[j].estado = 'buying';
            }
          }
        }
        for (let k of articulos.order) {
          for (let l = 0; l < this.articulos.length; l++) {
            if (k.id_articulo == this.articulos[l].CODIGO && this.articulos[l].fecha_recibido == null) {
              arts[l].estado = 'pending';
            }
          }
        }
      }
      this.articulos = arts;
    }
  }

  closedModal(): void {
    this.programarAvance();
    this.refreshIcon();
  }

}
