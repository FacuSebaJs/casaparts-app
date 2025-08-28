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
  placeholder = 'assets/images/Casaparts_logo2.png';
  trackByIndex(i: number) { return i; }
  private cancelador$ = new Subject<void>();


  constructor(private cartService: CartService, private router: Router, private _orderService: OrderService, private _sessionService: SessionService, private _articuloService: ArticuloService) { }

  get subtotal(): number {
    return this.carrito.reduce((acc, it: any) => {
      const price = Number(it.precio) || 0;
      const qty = Number(it.cantidad ?? 1);
      return acc + price * qty;
    }, 0);
  }

  // Por ahora, en Cart el total = subtotal (el envío y pago se definen en /checkout)
  get total(): number { return this.subtotal; }

  get canProceed(): boolean { return this.carrito.length > 0; }

  ngOnInit(): void {
    this.cargaInicial();
  }

  async cargaInicial() {
    // const list = this.cartService.obtenerCarrito() || [];
    const cliente = this._sessionService.getUser();
    const list = await firstValueFrom(this._orderService.getBuy(cliente)) || [];
    console.log("LIST:", list);
    this.carrito = (list as any[]).map(x => ({
      ...x,
      // precio: Number(x.precio) || 0,
      // cantidad: Number(x.cantidad ?? 1)
    }));
  }

  // Fallback de imagen
  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = this.placeholder;
  }

  // Cantidades / eliminar
  inc(it: CartItem) {
    it.cantidad = Math.min(Number(it.cantidad ?? 1) + 1, (it as any).stock ?? 999);
    this.syncQty(it);
  }

  dec(it: CartItem) {
    it.cantidad = Math.max(Number(it.cantidad ?? 1) - 1, 1);
    this.syncQty(it);
  }

  onQtyChange(it: CartItem, v: string | number) {
    const n = Math.max(1, Math.min(Number(v) || 1, (it as any).stock ?? 999));
    it.cantidad = n;
    this.syncQty(it);
  }

  eliminar(it: CartItem) {
    const id = it.id ?? (it as any).codigo ?? it.articulo.DESCRIP as any;
    const svc: any = this.cartService;
    if (typeof svc.eliminarItem === 'function') svc.eliminarItem(id);
    this.carrito = this.carrito.filter(x => x !== it);
  }

  private syncQty(it: CartItem) {
    const id = it.id ?? (it as any).codigo ?? it.articulo.DESCRIP as any;
    const svc: any = this.cartService;
    if (typeof svc.actualizarCantidad === 'function') svc.actualizarCantidad(id, it.cantidad);
  }

  // Navegar al paso de checkout (detalles de entrega/pago)
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
        this.imagenes[i] = imagen;
      }
    } catch (err) {
      console.error('Error cargando imágenes', err);
    }
  }

}
