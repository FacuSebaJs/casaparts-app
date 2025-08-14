import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carrito: any[] = [];
  total: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.carrito = this.cartService.obtenerCarrito();
    this.total = this.carrito.reduce((acc, item) => acc + item.precio, 0);
  }

  confirmarPedido() {
    alert('¡Pedido confirmado!');
    this.cartService.clearCart();
    this.router.navigate(['/']); // o a login si preferís
  }

  volver() {
    this.router.navigate(['/']); // a Home o a donde quieras
  }
}
