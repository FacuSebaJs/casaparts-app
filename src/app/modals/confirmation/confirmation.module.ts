import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfirmationModal } from './confirmation.modal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        ConfirmationModal
    ],
    declarations: [
        ConfirmationModal
    ]
})
export class ConfirmationModule { }
