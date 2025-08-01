import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public cartItems: any[] = [];
  public cartCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor() {}

  agregarProducto(producto: any): void {
    this.cartItems.push(producto);
    this.cartCount.next(this.cartItems.length);
    console.log('Producto agregado al carrito:', producto);
  }

  obtenerCarrito(): any[] {
    return this.cartItems;
  }

  limpiarCarrito(): void {
    this.cartItems = [];
    this.cartCount.next(0);
    console.log('Carrito limpiado.');
  }

  getCart(): any[] {
    return this.cartItems;
  }

  getCartCount(): BehaviorSubject<number> {
    return this.cartCount;
  }

  clearCart(): void {
    this.limpiarCarrito(); // método redundante por compatibilidad
  }
}
