import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  CONTADO: number, COSTO: number, TARJETA: number, VENTA: number, articulo: { ART: number, AUTO: string, CODIGO: string, COSTO: string, DESCRIP: string, DESCRIP2: string, DESCRIP3: string, DTO: any, MARCA: string, N: number, ORIGINAL: string, PRECIO: string, QLISTA: string, QSTOCK: string, RUBRO: string, RUBRODTO: null }, cantidad: number, fecha_creacion: Date, fecha_recibido: Date | null, id: number, id_articulo: string, id_pedido: number
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

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.cartItems));
    this.cartCount.next(this.cartItems.length);
  }

  // add(item: CartItem): void {
  //   const id = item.id ?? item.articulo.CODIGO ?? item.articulo.DESCRIP;
  //   const precio = Number(item.articulo.PRECIO ?? 0);
  //   const pack = this.getPackSize(item);
  //   const incQty = Math.max(1, Number(item.cantidad ?? 1));

  //   // const idx = this.cartItems.findIndex(
  //   //   x => (x.id ?? x.articulo.CODIGO ?? x.articulo.DESCRIP) === id
  //   // );
  //   this.cartItems = this.load();
  //   const idx = this.findIndexById(id);

  //   if (idx > -1) {
  //     const cur = this.cartItems[idx];
  //     const currentQty = Math.max(1, Number(cur.cantidad ?? 1));
  //     const desired = currentQty + incQty;
  //     const snapped = this.snapToPack(desired, pack);
  //     // this.cartItems[idx] = { ...cur, cantidad: snapped, _pack: pack };
  //   } else {
  //     // primera vez: al menos un pack
  //     const initial = Math.max(incQty, pack);
  //     const snapped = this.snapToPack(initial, pack);
  //     // this.cartItems.push({ ...item, id, precio, cantidad: snapped, _pack: pack });
  //   }

  //   this.save();
  //   // console.info(`Empaque x${pack}. Cantidad ajustada a múltiplo.`);
  // }

  // /** Actualiza cantidad y la ajusta al múltiplo del pack. */
  // actualizarCantidad(idOCodigo: string | number, qty: number) {
  //   // const idStr = String(idOCodigo);
  //   // const idx = this.cartItems.findIndex(
  //   //   x => String(x.id ?? x.articulo.CODIGO ?? x.articulo.DESCRIP) === idStr
  //   // );
  //   this.cartItems = this.load();
  //   const idx = this.findIndexById(idOCodigo);
  //   if (idx > -1) {
  //     const pack = this.getPackSize(this.cartItems[idx]);
  //     this.cartItems[idx].cantidad = this.snapToPack(qty, pack);
  //     // this.cartItems[idx]._pack = pack;
  //     this.save();
  //   }
  // }

  /** Elimina una línea del carrito */
  eliminarItem(idOCodigo: string | number) {
    this.cartItems = this.load();
    const idStr = String(idOCodigo);
    this.cartItems = this.cartItems.filter(
      x => String(x.id ?? x.articulo.CODIGO ?? x.articulo.DESCRIP) !== idStr
      // x => String(this.getId(x)) !== idStr
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
  // agregarProducto(producto: any) { this.add(producto); }
  limpiarCarrito(): void { this.clearCart(); }
}
