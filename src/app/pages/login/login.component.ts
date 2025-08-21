import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  cliente: number | null = null;
  clave: string = '';
  Email: string = '';

  constructor(private router: Router, private _authService: AuthService) { }

  ingresar() {
    this._authService.login(this.cliente, this.Email, this.clave).subscribe({
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
