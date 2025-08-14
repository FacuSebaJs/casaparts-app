import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id?: string | number;
  [k: string]: any; // flexible para ahora
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);

  // ---- API pública unificada
  add(item: CartItem): void {
    this.cartItems.push(item);
    this.cartCount.next(this.cartItems.length);
    console.log('Producto agregado al carrito:', item);
  }

  getCart(): CartItem[] {
    return this.cartItems;
  }

  getCartCount$() {
    return this.cartCount.asObservable();
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartCount.next(0);
    console.log('Carrito limpiado.');
  }

  // --- Compatibilidad con nombres anteriores (opcional)
  agregarProducto(producto: any) { this.add(producto); }
  obtenerCarrito(): any[] { return this.getCart(); }
  limpiarCarrito(): void { this.clearCart(); }
}
