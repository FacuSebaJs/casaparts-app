import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../core/services/socket.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  client?: number;
  password: string;
  email: string;

  constructor(private router: Router, private _authService: AuthService, private _toastrService: ToastrService, private _sessionService: SessionService, private _socketService: SocketService) {
    this.client = Number(this._sessionService.getClient()) || undefined;
    this.email = this._sessionService.getEmail() || '';
    this.password = this._sessionService.getPassword() || '';
  }

  ngOnInit(): void {
    this._socketService.disconnect();
  }

  ingresar(): void {
    if (this.client && this.email && this.password) {
      this._authService.login(this.getClient(), this.email, this.password).subscribe({
        next: (response: any) => {
          if (response.acceso_permitido == true) {
            this._sessionService.setLoginData({
              client: this.getClient().toString(),
              email: this.email,
              password: this.password,
              token: response.token ? response.token : 'development'
            })
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
  }

  getClient(): number {
    return this.client || 0;
  }

}
