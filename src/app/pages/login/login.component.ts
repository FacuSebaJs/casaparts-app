import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  cliente: number | null = null;
  clave: string = '';
  Email: string = '';

  constructor(private router: Router, private _authService: AuthService, private _toastrService: ToastrService, private _socketService: SocketService) { }

  ingresar() {
    this._authService.login(this.cliente, this.Email, this.clave).subscribe({
      next: (response: any) => {
        if (response.acceso_permitido == true) {
          localStorage.setItem('loginClientNumber', this.cliente?.toString() || '');
          localStorage.setItem('token', response.token ? response.token : 'development');
          localStorage.setItem('user', this.cliente?.toString() || '');
          this.router.navigate(['/home']);
        }
        else {
          if (response.error_code == 6) {
            this._toastrService.error('Esta cuenta no se encuentra autorizada', 'Error');
          }
          else {
            this._toastrService.warning('Usuario incorrecto', 'Atención');
          }
        }
      },
      error: () => {
        this._toastrService.error('Error al validar el usuario', 'Error');
      }
    });

  }

  ngOnInit() {
    this._socketService.disconnect();
  }

}
