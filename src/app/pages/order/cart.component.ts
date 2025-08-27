import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/api/cart.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carrito: CartItem[] = [];

  // placeholder del logo (fallback)
  placeholder = 'assets/images/Casaparts_logo2.png';

  constructor(private cartService: CartService, private router: Router) {}

  trackByIndex(i: number) { return i; }

  get subtotal(): number {
    return this.carrito.reduce((acc, it: any) => {
      const price = Number(it?.precio) || 0;
      const qty = Number(it?.cantidad ?? 1);
      return acc + price * qty;
    }, 0);
  }

  // En Cart el total = subtotal (envío/pago se definen en /checkout)
  get total(): number { return this.subtotal; }

  get canProceed(): boolean { return (this.carrito?.length ?? 0) > 0; }

  ngOnInit(): void {
    const list = this.cartService.obtenerCarrito() || [];
    this.carrito = (list as any[]).map(x => ({
      ...x,
      precio: Number(x?.precio) || 0,
      cantidad: Number(x?.cantidad ?? 1)
    }));
  }

  // Fallback de imagen
  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = this.placeholder;
  }

  // Eliminar ítem (se mantiene)
  eliminar(it: CartItem) {
    const id = it?.id ?? (it as any)?.codigo ?? (it as any)?.nombre;
    const svc: any = this.cartService;
    if (typeof svc.eliminarItem === 'function') svc.eliminarItem(id);
    this.carrito = this.carrito.filter(x => x !== it);
  }

  // Navegar al paso de checkout
  irAConfirmar() {
    if (!this.canProceed) return;
    this.router.navigate(['/checkout']);
  }

  volver() { this.router.navigate(['/']); }
}
