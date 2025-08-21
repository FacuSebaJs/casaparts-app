import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { LoginRoutingModule } from './login-routing.module';


@NgModule({
    declarations: [LoginComponent],
    imports: [CommonModule, FormsModule, LoginRoutingModule],
    providers: [AuthService],
    exports: []
})
export class LoginModule { }