import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id?: string | number;
  nombre?: string;
  precio?: number;
  cantidad?: number;
  imagen?: string;
  marca?: string;
  codigo?: string | number;
  [k: string]: any; // flexible para ahora
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private KEY = 'cart';
  private cartItems: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);

  constructor() {
    this.cartItems = this.load();
    this.cartCount.next(this.cartItems.length);
  }

  // -- Storage helpers --
  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.cartItems));
    this.cartCount.next(this.cartItems.length);
  }

  // -- API pública (respetando tus nombres) --
  /** Devuelve una copia sincronizada con storage */
  getCart(): CartItem[] {
    this.cartItems = this.load();
    return [...this.cartItems];
  }

  /** Agrega (o incrementa si ya existe) */
  add(item: CartItem): void {
    const id = item.id ?? item.codigo ?? item.nombre;
    const precio = Number(item.precio ?? 0);
    const cantidad = Math.max(1, Number(item.cantidad ?? 1));

    const idx = this.cartItems.findIndex(
      x => (x.id ?? x.codigo ?? x.nombre) === id
    );

    if (idx > -1) {
      const cur = this.cartItems[idx];
      const newQty = Math.max(1, Number(cur.cantidad ?? 1) + cantidad);
      this.cartItems[idx] = { ...cur, cantidad: newQty };
    } else {
      this.cartItems.push({ ...item, id, precio, cantidad });
    }

    this.save();
    console.log('Producto agregado al carrito:', item);
  }

  /** Actualiza cantidad de una línea del carrito */
  actualizarCantidad(idOCodigo: string | number, qty: number) {
    const idStr = String(idOCodigo);
    const idx = this.cartItems.findIndex(
      x => String(x.id ?? x.codigo ?? x.nombre) === idStr
    );
    if (idx > -1) {
      this.cartItems[idx].cantidad = Math.max(1, Number(qty) || 1);
      this.save();
    }
  }

  /** Elimina una línea del carrito */
  eliminarItem(idOCodigo: string | number) {
    const idStr = String(idOCodigo);
    this.cartItems = this.cartItems.filter(
      x => String(x.id ?? x.codigo ?? x.nombre) !== idStr
    );
    this.save();
  }

  getCartCount$() {
    return this.cartCount.asObservable();
  }

  clearCart(): void {
    this.cartItems = [];
    this.save();
    console.log('Carrito limpiado.');
  }

  // -- Aliases que ya usabas --
  agregarProducto(producto: any) { this.add(producto); }
  obtenerCarrito(): any[] { return this.getCart(); }
  limpiarCarrito(): void { this.clearCart(); }
}
