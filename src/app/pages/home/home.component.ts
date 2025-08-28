import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/api/cart.service';
import { firstValueFrom, Subject, Subscription, takeUntil } from 'rxjs';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { SocketService } from '../../core/services/socket.service';
import { OrderService } from '../../core/services/api/order.service';
import { SessionService } from '../../core/services/session.service';
import { ToastrService } from 'ngx-toastr';
import { Carousel, Dropdown } from 'bootstrap';


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('carouselOfertas', { static: false }) carouselElement!: ElementRef;
  carouselInstance: any;
  cargandoProductos = false;
  errorProductos = '';
  articulos: any[] = [];
  busqueda: string = '';
  imagenes: string[] = [];
  spinner: boolean = false;
  configCliente: { general: number | null, contado: number | null, tarjeta: number | null, descuento: number | null } = { general: null, contado: null, tarjeta: null, descuento: null };
  precios: { costo: number | null, venta: number | null, contado: number | null, tarjeta: number | null }[] = [];
  indexImagen: number = 0;
  private cancelador$ = new Subject<void>();
  private slideListener: any;
  private readonly unsubscribe$: Subject<void> = new Subject<void>();
  private obsSocConnect: Subscription = new Subscription();
  private obsSocRoom: Subscription = new Subscription();
  private obsChangedOrder: Subscription = new Subscription();
  private obsChangedOrderDetail: Subscription = new Subscription();
  cliente: string | null = null;
  articulosCarrito: number = 0;

  constructor(
    private router: Router,
    private _cartService: CartService,
    private _articuloService: ArticuloService,
    private _configClienteService: ConfigClienteService,
    private _socketService: SocketService,
    private _orderService: OrderService,
    private _sessionService: SessionService,
    private _toastrService: ToastrService
  ) { }

  get cartLength(): number {
    return this._cartService.getCart()?.length ?? 0;
  }

  ngOnInit(): void {
    this.cargaInicial();
  }

  ngOnDestroy(): void {
    this.removeListener();
  }

  ngAfterViewInit(): void {
    this.initCarrusel();
  }

  initCarrusel() {
    this.removeListener();
    if (this.carouselInstance) {
      this.carouselInstance.dispose();
    }
    setTimeout(() => {
      const el = this.carouselElement?.nativeElement;
      if (el) {
        this.carouselInstance = new Carousel(el);
        this.slideListener = async () => {
          this.pausarCarrusel();
          const activeItem = el.querySelector('.carousel-item.active');
          const items = Array.from(el.querySelectorAll('.carousel-item'));
          const currentIndex = items.indexOf(activeItem as Element);
          this.indexImagen = currentIndex;
          this.spinner = true;
          await this.actualizarDatos(currentIndex);
          this.spinner = false;
          this.reanudarCarrusel();
        };
        el.addEventListener('slid.bs.carousel', this.slideListener);
      }
    });
  }

  removeListener() {
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
    this.cliente = this._sessionService.getUser();
    this.spinner = true;
    await this.cargarConfigCliente();
    await this.cargarnovedades();
    await this.cargarCarrito();
    this.spinner = false;
    this.reanudarCarrusel();
    this.initSocket();
  }

  agregarAlCarrito(p: any): void {
    // const item = this.mapProductoAItem(p);
    // this._cartService.add(item);
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
    this.router.navigate(['/order']);
  }

  trackByIndex = (i: number) => i;

  async cargarDatosVacios(articulos: any[]) {
    this.articulos = [];
    this.imagenes = Array(articulos.length).fill("");
    this.precios = Array(articulos.length).fill({ costo: null, venta: null, contado: null, tarjeta: null });
    this.cancelador$.next();
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
      const imagenes = await firstValueFrom(this._articuloService.getUrlImages(this.articulos[index].CODIGO)
        .pipe(takeUntil(this.cancelador$)));
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
    this.pausarCarrusel();
    if (this.busqueda == '') {
      await this.cargarnovedades();
    }
    else {
      await this.filtrar();
    }
    this.reanudarCarrusel();
    setTimeout(() => this.initCarrusel());
  }

  async filtrar() {
    try {
      this.spinner = true;
      this.imagenes[this.indexImagen] = '';
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

  async cargarnovedades() {
    try {
      const articulos = await firstValueFrom(this._articuloService.getNov(Number(this.cliente)));
      await this.cargarDatosVacios(articulos);
      this.articulos = articulos;
      await this.refreshIcon();
      await this.actualizarDatos(0);
    } catch (err) {
      console.error('Error cargando novedades', err);
      throw err;
    }
  }

  async cargarConfigCliente() {
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

  private twoDecimal(value: any) {
    return Number(Number(value).toFixed(2));
  }

  private initSocket(): void {
    this._socketService.connect();
    if (this.obsSocConnect) {
      this.obsSocConnect.unsubscribe();
    }
    this.obsSocConnect = this._socketService.connected()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((message) => {
        console.info('%c' + message, 'color:Lightgreen');
        this._socketService.connectRoom();
      });
    if (this.obsSocRoom) {
      this.obsSocRoom.unsubscribe();
    }
    this.obsSocRoom = this._socketService.connectedRoom()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((message) => {
        console.info('%c' + message, 'color:Lightgreen');
      });
    if (this.obsChangedOrder) {
      this.obsChangedOrder.unsubscribe();
    }
    this.obsChangedOrder = this._socketService.changedOrder()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (data) => {
        const action: string = data.isNew ? 'generado' : ' actualizado';
        let order: number = 1;
        const response = await firstValueFrom(this._orderService.getBuyIcon(Number(this.cliente)));
        if (data.order) {
          order = data.order;
        }
        else if (response && response.order.length) {
          order = response.order[0].order + 1;
        }
        const message: string = `Se ha ${action} el pedido N° ${order}`;
        this._toastrService.info(message);
      })
    if (this.obsChangedOrderDetail) {
      this.obsChangedOrderDetail.unsubscribe();
    }
    this.obsChangedOrderDetail = this._socketService.changedOrderDetail()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (data) => {
        const action: string = data == 'agregar' ? 'agregado' : 'modificado';
        let message: string = `Se ha ${action} artículo/s en su compra`;
        if (data == 'quitar') {
          message = `Quitando artículos`;
        }
        if (data == 'iniciar') {
          message = `Se ha iniciado una nueva compra`;
        }
        if (data != 'quitar') {
          this._toastrService.info(message, 'Información');
          this.toggleMenu(true);
        }
        await this.cargarCarrito();
        await this.refreshIcon();
        return null;
      })
  }

  removeSockets() {
    if (this.obsSocConnect) {
      this.obsSocConnect.unsubscribe();
    }
    if (this.obsSocRoom) {
      this.obsSocRoom.unsubscribe();
    }
    if (this.obsChangedOrder) {
      this.obsChangedOrder.unsubscribe();
    }
    if (this.obsChangedOrderDetail) {
      this.obsChangedOrderDetail.unsubscribe();
    }
    this._socketService.disconnect();
  }

  async refreshIcon() {
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

  logout(): void {
    this._sessionService.removeToken();
    window.location.reload();
  }

  toggleMenu(forceShow = false) {
    const dropdownButton = document.getElementById("dropdownMenuButton");
    if (dropdownButton) {
      const dropdownInstance = Dropdown.getOrCreateInstance(dropdownButton);
      const menu = dropdownButton.nextElementSibling;
      const isOpen = menu?.classList.contains('show');
      if (forceShow) {
        if (!isOpen) {
          dropdownInstance.show();
        }
      }
      else {
        isOpen ? dropdownInstance.hide() : dropdownInstance.show();
      }
    }
  }

  async cargarCarrito() {
    try {
      const buy = await firstValueFrom(this._orderService.getBuy(this.cliente));
      this.articulosCarrito = buy.length;
    }
    catch (err) {
      console.error('Error obteniendo cantidad del carrito', err);
    }
  }

}
