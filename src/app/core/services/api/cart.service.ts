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
  _pack?: number;
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

  // ===== Helpers de storage =====
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

  // ===== Helpers de negocio (ID, pack, snap) =====
  /** ID estable para un ítem (toma el primero que exista). */
  private getId(it: CartItem): string | number {
    return it.id ?? it.codigo ?? (it as any)?.CODIGO ?? it.nombre ?? (it as any)?.DESCRIP;
  }

  /** Lee la unidad de empaque desde varios posibles nombres. Default = 1. */
  private getPackSize(it: any): number {
    const raw =
      it?.pack ??
      it?.empaque ??
      it?.unidad_empaque ??
      it?.unidadEmpaque ??
      it?.u_x_pack ??
      it?.uPack ??
      it?.packSize ??
      it?.PACK ??
      it?.presentacion ??
      it?.UNIDxPAQ ??
      1;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 1;
  }

  /** Redondea hacia arriba al múltiplo del pack. */
  private snapToPack(qty: number, pack: number): number {
    const q = Math.max(1, Math.trunc(Number(qty) || 1));
    if (!pack || pack <= 1) return q;
    return Math.ceil(q / pack) * pack;
  }

  /** Busca índice por ID. */
  private findIndexById(id: string | number): number {
    const idStr = String(id);
    return this.cartItems.findIndex(x => String(this.getId(x)) === idStr);
  }

  // ===== API pública =====

  /** Devuelve una copia sincronizada con storage */
  getCart(): CartItem[] {
    this.cartItems = this.load();
    return [...this.cartItems];
  }

  /**
   * Agrega (o incrementa si ya existe), ajustando SIEMPRE a múltiplo del pack.
   * - Si el ítem no estaba: como mínimo un pack completo.
   * - Si ya estaba: suma y hace snap al múltiplo del pack.
   */
  add(item: CartItem): void {
    // sincronizo memoria por si otro tab modificó
    this.cartItems = this.load();

    const id = this.getId(item);
    const precio = Number(item.precio ?? 0);
    const pack = this.getPackSize(item); // 👈 unidad de empaque
    const incQty = Math.max(1, Number(item.cantidad ?? 1));

    const idx = this.findIndexById(id);

    if (idx > -1) {
      const cur = this.cartItems[idx];
      const currentQty = Math.max(1, Number(cur.cantidad ?? 1));
      const desired = currentQty + incQty;
      const snapped = this.snapToPack(desired, pack);
      this.cartItems[idx] = { ...cur, cantidad: snapped, _pack: pack };
    } else {
      // primera vez: al menos un pack
      const initial = Math.max(incQty, pack);
      const snapped = this.snapToPack(initial, pack);
      this.cartItems.push({ ...item, id, precio, cantidad: snapped, _pack: pack });
    }

    this.save();
    // console.info(`Empaque x${pack}. Cantidad ajustada a múltiplo.`);
  }

  /** Actualiza cantidad y la ajusta al múltiplo del pack. */
  actualizarCantidad(idOCodigo: string | number, qty: number) {
    this.cartItems = this.load();
    const idx = this.findIndexById(idOCodigo);
    if (idx > -1) {
      const pack = this.getPackSize(this.cartItems[idx]);
      this.cartItems[idx].cantidad = this.snapToPack(qty, pack);
      this.cartItems[idx]._pack = pack;
      this.save();
    }
  }

  /** Elimina una línea del carrito */
  eliminarItem(idOCodigo: string | number) {
    this.cartItems = this.load();
    const idStr = String(idOCodigo);
    this.cartItems = this.cartItems.filter(
      x => String(this.getId(x)) !== idStr
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
