import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderedQuantityModal } from './orderedQuantity.modal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        OrderedQuantityModal
    ],
    declarations: [OrderedQuantityModal]
})
export class OrderedQuantityModule { }
