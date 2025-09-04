import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../../core/services/api/cart.service';
import { OrderService } from '../../core/services/api/order.service';
import { firstValueFrom, Subject, Subscription, takeUntil } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { SocketService } from '../../core/services/socket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  carrito: CartItem[] = [];
  imagenes: string[] = [];
  precios: number[] = [];
  total: number = 0;
  spinner: boolean = false;
  cancelador$ = new Subject<void>();
  obsChangedOrderDetail = new Subscription();
  unsubscribe$ = new Subject<void>();

  constructor(private router: Router, private _orderService: OrderService, private _sessionService: SessionService, private _articuloService: ArticuloService, private _socketService: SocketService, private _toastrService: ToastrService) {
  }

  trackByIndex(i: number): number {
    return i;
  }

  get canProceed(): boolean {
    return (this.carrito?.length ?? 0) > 0;
  }

  ngOnInit(): void {
    this.cargaInicial();
    this.initSocket();
  }

  ngOnDestroy(): void {
    this.removeListener();
    this.removeSockets();
  }

  async eliminar(index: number): Promise<void> {
    const cliente = this._sessionService.getClient();
    try {
      await firstValueFrom(this._orderService.deleteArt(cliente, this.carrito[index].id));
      this.carrito.splice(index, 1);
      this.precios.splice(index, 1);
      this.imagenes.splice(index, 1);
      this.cargarTotal();
    }
    catch (err) {
      console.error('Error al eliminar artículo', err);
      throw err;
    }
  }

  async confirmar(): Promise<void> {
    try {
      this.spinner = true;
      await firstValueFrom(this._orderService.sendOrder(this.carrito[0].id_pedido, null));
      this.carrito = [];
    }
    catch (err) {
      console.error('Error al confirmar pedido', err);
      throw err;
    }
    finally {
      this.spinner = false;
    }
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  private async cargaInicial(): Promise<void> {
    this.spinner = true;
    const cliente = this._sessionService.getClient();
    const list = await firstValueFrom(this._orderService.getBuy(cliente)) || [];
    this.cargarDatosVacios(list.length);
    this.carrito = list;
    this.cargarPrecios();
    await this.obtenerImagenes();
    this.spinner = false;
  }

  private cargarPrecios(): void {
    for (let i = 0; i < this.carrito.length; i++) {
      this.precios[i] = this.twoDecimal(this.twoDecimal(this.carrito[i].COSTO) * this.twoDecimal(this.carrito[i].cantidad));
    }
    this.cargarTotal();
  }

  private cargarTotal(): void {
    let total = 0;
    for (let i = 0; i < this.precios.length; i++) {
      total = this.twoDecimal(total + this.precios[i]);
    }
    this.total = total;
  }

  private twoDecimal(value: any): number {
    return Number(Number(value).toFixed(2));
  }

  private async obtenerImagen(codigo: string): Promise<any> {
    try {
      const imagenes = await firstValueFrom(this._articuloService.getUrlImages(codigo)
        .pipe(takeUntil(this.cancelador$)));
      if (imagenes && imagenes.length > 0) {
        return imagenes[0];
      }
      else {
        return null;
      }
    } catch (err) {
      console.error('Error cargando imagen', err);
      return null;
    }
  }

  private async obtenerImagenes(): Promise<void> {
    try {
      for (let i = 0; i < this.carrito.length; i++) {
        const imagen = await this.obtenerImagen(this.carrito[i].articulo.CODIGO);
        this.imagenes[i] = imagen?.formatos?.original ?? imagen;
      }
    } catch (err) {
      console.error('Error cargando imágenes', err);
    }
  }

  private async cargarDatosVacios(length: number): Promise<void> {
    this.imagenes = Array(length).fill("");
    this.precios = Array(length).fill(0);
    this.cancelador$.next();
  }

  private initSocket(): void {
    if (this.obsChangedOrderDetail) {
      this.obsChangedOrderDetail.unsubscribe();
    }
    this.obsChangedOrderDetail = this._socketService.changedOrderDetail()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (data) => {
        this.spinner = true;
        const action: string = data == 'agregar' ? 'agregado' : data == 'quitar' ? 'quitado' : 'modificado';
        let message: string = `Se ha ${action} artículo/s en su compra`;
        if (data == 'iniciar') {
          message = `Se ha iniciado una nueva compra`;
        }
        if (data != 'quitar') {
          this._toastrService.info(message, 'Información');
        }
        await this.cargaInicial();
        this.spinner = false;
      })
  }

  private removeListener(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private removeSockets(): void {
    if (this.obsChangedOrderDetail) {
      this.obsChangedOrderDetail.unsubscribe();
    }
  }

}
