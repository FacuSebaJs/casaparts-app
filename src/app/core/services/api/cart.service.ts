import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OrderItem {
  CONTADO: number, COSTO: number, TARJETA: number, VENTA: number, articulo: { ART: number, AUTO: string, CODIGO: string, COSTO: string, DESCRIP: string, DESCRIP2: string, DESCRIP3: string, DTO: any, MARCA: string, N: number, ORIGINAL: string, PRECIO: string, QLISTA: string, QSTOCK: string, RUBRO: string, RUBRODTO: null }, cantidad: number, fecha_creacion: Date, fecha_recibido: Date | null, id: number, id_articulo: string, id_pedido: number
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private KEY = 'cart';
  private OrderItems: OrderItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);

  constructor() {
    this.OrderItems = this.load();
    this.cartCount.next(this.OrderItems.length);
  }

  private load(): OrderItem[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.OrderItems));
    this.cartCount.next(this.OrderItems.length);
  }

  // add(item: OrderItem): void {
  //   const id = item.id ?? item.articulo.CODIGO ?? item.articulo.DESCRIP;
  //   const precio = Number(item.articulo.PRECIO ?? 0);
  //   const pack = this.getPackSize(item);
  //   const incQty = Math.max(1, Number(item.cantidad ?? 1));

  //   // const idx = this.OrderItems.findIndex(
  //   //   x => (x.id ?? x.articulo.CODIGO ?? x.articulo.DESCRIP) === id
  //   // );
  //   this.OrderItems = this.load();
  //   const idx = this.findIndexById(id);

  //   if (idx > -1) {
  //     const cur = this.OrderItems[idx];
  //     const currentQty = Math.max(1, Number(cur.cantidad ?? 1));
  //     const desired = currentQty + incQty;
  //     const snapped = this.snapToPack(desired, pack);
  //     // this.OrderItems[idx] = { ...cur, cantidad: snapped, _pack: pack };
  //   } else {
  //     // primera vez: al menos un pack
  //     const initial = Math.max(incQty, pack);
  //     const snapped = this.snapToPack(initial, pack);
  //     // this.OrderItems.push({ ...item, id, precio, cantidad: snapped, _pack: pack });
  //   }

  //   this.save();
  //   // console.info(`Empaque x${pack}. Cantidad ajustada a múltiplo.`);
  // }

  // /** Actualiza cantidad y la ajusta al múltiplo del pack. */
  // actualizarCantidad(idOCodigo: string | number, qty: number) {
  //   // const idStr = String(idOCodigo);
  //   // const idx = this.OrderItems.findIndex(
  //   //   x => String(x.id ?? x.articulo.CODIGO ?? x.articulo.DESCRIP) === idStr
  //   // );
  //   this.OrderItems = this.load();
  //   const idx = this.findIndexById(idOCodigo);
  //   if (idx > -1) {
  //     const pack = this.getPackSize(this.OrderItems[idx]);
  //     this.OrderItems[idx].cantidad = this.snapToPack(qty, pack);
  //     // this.OrderItems[idx]._pack = pack;
  //     this.save();
  //   }
  // }

  /** Elimina una línea del carrito */
  eliminarItem(idOCodigo: string | number) {
    this.OrderItems = this.load();
    const idStr = String(idOCodigo);
    this.OrderItems = this.OrderItems.filter(
      x => String(x.id ?? x.articulo.CODIGO ?? x.articulo.DESCRIP) !== idStr
      // x => String(this.getId(x)) !== idStr
    );
    this.save();
  }

  getCartCount$() {
    return this.cartCount.asObservable();
  }

  clearCart(): void {
    this.OrderItems = [];
    this.save();
    console.log('Carrito limpiado.');
  }

  // -- Aliases que ya usabas --
  // agregarProducto(producto: any) { this.add(producto); }
  limpiarCarrito(): void { this.clearCart(); }
}
