import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppRoutingModule } from './app.routes';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { SocketService } from './core/services/socket.service';
import localeEs from '@angular/common/locales/es-AR';
registerLocaleData(localeEs, 'es-AR');
import { GlobalConfig, ToastrModule } from 'ngx-toastr';
import { MenuDropdownModule } from './pages/menu/menu-dropdown.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

const socketConfig: SocketIoConfig = {
    url: environment.SOCKET_URL, options: {
        autoConnect: false,
        path: environment.SOCKET_PATH,
        transports: [

            'flashsocket',
            'htmlfile',
            'websocket',
            'ws',
            'wss'
        ]
    }
};

const toastConfig: Partial<GlobalConfig> = {
    timeOut: 5000,
    positionClass: 'toast-bottom-full-width-custom',
    preventDuplicates: true,
    closeButton: false,
    maxOpened: 1,
    autoDismiss: true,
    tapToDismiss: false
}

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        SocketIoModule.forRoot(socketConfig),
        ToastrModule.forRoot(toastConfig),
        MenuDropdownModule
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'es-AR' },
        provideHttpClient(withInterceptorsFromDi()),
        SocketService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    exports: [ToastrModule]
})
export class AppModule { }
