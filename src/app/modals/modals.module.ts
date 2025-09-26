import { NgModule } from '@angular/core';
import { OrderedQuantityModule } from './orderedQuantity/orderedQuantity.module';
import { ConfirmationModule } from './confirmation/confirmation.module';

@NgModule({
    imports: [
        OrderedQuantityModule,
        ConfirmationModule
    ],
    exports: [
        OrderedQuantityModule,
        ConfirmationModule
    ],
    declarations: []
})
export class ModalsModule { }
