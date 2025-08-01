import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  cliente: string = '';
  clave: string = '';

  constructor(private router: Router) {}

  ingresar() {
    // Saltamos validación en esta demo
    this.router.navigate(['/home']);
  }
}
