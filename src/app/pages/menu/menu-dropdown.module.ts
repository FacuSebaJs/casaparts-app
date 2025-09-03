import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuDropdownComponent } from './menu-dropdown.component';
import { OrderService } from '../../core/services/api/order.service';


@NgModule({
    declarations: [MenuDropdownComponent],
    imports: [CommonModule, FormsModule],
    providers: [OrderService],
    exports: [MenuDropdownComponent]
})
export class MenuDropdownModule { }