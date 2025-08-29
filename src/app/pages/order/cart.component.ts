import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/api/cart.service';
import { OrderService } from '../../core/services/api/order.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { ArticuloService } from '../../core/services/api/articulo.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carrito: CartItem[] = [];
  imagenes: string[] = [];
  totales: number[] = [];
  private cancelador$ = new Subject<void>();
  total: number = 0;


  constructor(private cartService: CartService, private router: Router, private _orderService: OrderService, private _sessionService: SessionService, private _articuloService: ArticuloService) { }

  trackByIndex(i: number) { return i; }

  get canProceed(): boolean { return (this.carrito?.length ?? 0) > 0; }

  ngOnInit(): void {
    this.cargaInicial();
  }

  async cargaInicial() {
    const cliente = this._sessionService.getUser();
    const list = await firstValueFrom(this._orderService.getBuy(cliente)) || [];
    this.carrito = list;
    this.cargarDatosVacios(this.carrito.length);
    this.cargarTotales();
    await this.obtenerImagenes();
  }

  cargarTotales() {
    this.total = 0;
    for (let i = 0; i < this.carrito.length; i++) {
      this.totales[i] = this.twoDecimal(this.twoDecimal(this.carrito[i].COSTO) * this.twoDecimal(this.carrito[i].cantidad));
      this.total = this.twoDecimal(this.total + this.totales[i]);
    }
  }

  private twoDecimal(value: any) {
    return Number(Number(value).toFixed(2));
  }

  async eliminar(index: number) {
    const cliente = this._sessionService.getUser();
    try {
      await firstValueFrom(this._orderService.deleteArt(cliente, this.carrito[index].id));
      this.carrito.splice(index, 1);
    }
    catch (err) {
      console.error('Error al eliminar artículo', err);
      throw err;
    }
  }

  irAConfirmar() {
    if (!this.canProceed) return;
    this.router.navigate(['/checkout']);
  }

  volver() { this.router.navigate(['/']); }

  async obtenerImagen(codigo: string) {
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

  async obtenerImagenes() {
    try {
      for (let i = 0; i < this.carrito.length; i++) {
        const imagen = await this.obtenerImagen(this.carrito[i].articulo.CODIGO);
        this.imagenes[i] = imagen?.formatos?.original ?? imagen;
      }
    } catch (err) {
      console.error('Error cargando imágenes', err);
    }
  }

  async cargarDatosVacios(length: number) {
    this.imagenes = Array(length).fill("");
    this.totales = Array(length).fill(0);
    this.cancelador$.next();
  }

}
