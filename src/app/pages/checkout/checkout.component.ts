import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../cart/cart.service'; // ajusta la ruta si difiere

type DeliveryMode = 'pickup' | 'delivery';
type PaymentMethod = 'mp' | 'cash';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  carrito: CartItem[] = [];

  // Estado del checkout
  deliveryMode: DeliveryMode = 'pickup';
  paymentMethod: PaymentMethod = 'mp';
  address = { street: '', number: '', cp: '' };
  notes = '';
  shippingFee = 0;

  constructor(private cart: CartService, private router: Router) {}

  ngOnInit(): void {
    this.carrito = this.cart.obtenerCarrito() || [];
    if (this.carrito.length === 0) this.router.navigate(['/cart']);
    this.recalcShipping();
  }

  get subtotal(): number {
    return (this.carrito || []).reduce((acc, it: any) =>
      acc + (Number(it.precio) || 0) * (Number(it.cantidad ?? 1)), 0);
  }
  get total(): number { return this.subtotal + this.shippingFee; }

  // ENVÍO
  onDeliveryChange(){ this.recalcShipping(); }
  recalcShipping(){
    if (this.deliveryMode === 'delivery') {
      const cp = (this.address.cp || '').trim();
      this.shippingFee = this.estimateShipping(cp);
    } else {
      this.shippingFee = 0;
    }
  }
  private estimateShipping(cp: string): number {
    if (!cp || cp.length < 4) return 0;
    const base = 2500;
    const band = parseInt(cp[0], 10);
    return base + (isNaN(band) ? 0 : band * 200);
  }

  get canConfirm(): boolean {
    if ((this.carrito?.length || 0) === 0) return false;
    if (this.deliveryMode === 'delivery') {
      const a = this.address;
      if (!a.street || !a.number || !a.cp) return false;
      if (this.shippingFee <= 0) return false;
    }
    return true;
  }

  confirmarPedido(){
    if (!this.canConfirm) return;
    const orden = {
      items: this.carrito.map(i => ({
        id: i.id ?? (i as any).codigo ?? i.nombre,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad ?? 1
      })),
      entrega: this.deliveryMode,
      direccion: this.deliveryMode === 'delivery' ? this.address : undefined,
      notas: this.notes || undefined,
      subtotal: this.subtotal,
      envio: this.shippingFee,
      total: this.total,
      pago: this.paymentMethod
    };
    console.log('Orden confirmada:', orden);

    alert('¡Pedido confirmado!');
    this.cart.clearCart();
    this.router.navigate(['/']);
  }

  volver(){ this.router.navigate(['/cart']); }
}
