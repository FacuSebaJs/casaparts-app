import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { response } from 'express';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  cliente: number | null = null;
  clave: string = '';
  Email: string = '';

  constructor(private router: Router, private api: ApiService) { }

  ingresar() {
    this.api.login(this.cliente, this.Email, this.clave).subscribe({
      next: (response: any) => {
        if (response.acceso_permitido == true) {
          localStorage.setItem('loginClientNumber', this.cliente?.toString() || '');
          this.router.navigate(['/home']);
        }
        else {
          if (response.error_code == 6) {
            console.log('Esta cuenta no se encuentra autorizada')
          }
          else {
            console.log('Usuario incorrecto');
          }
        }
      },
      error: err => {
        console.error('Error al ingresar', err);
      }
    });

  }
}
