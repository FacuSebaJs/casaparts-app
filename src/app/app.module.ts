import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppRoutingModule } from './app.routes';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
// import { SocketService } from './socket.service';
import localeEs from '@angular/common/locales/es-AR';
registerLocaleData(localeEs, 'es-AR');

// const config: SocketIoConfig = {
//   url: environment.SOCKET_URL, options: {
//     autoConnect: false,
//     path: environment.SOCKET_PATH,
//     transports: [
//       'flashsocket',
//       'htmlfile',
//       'xhr-polling',
//       'jsonp-polling',
//       'polling',
//       'ws',
//       'wss'
//     ]
//   }
// };

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        CoreModule,
        FormsModule,
        ReactiveFormsModule,        
        // SocketIoModule.forRoot(config),
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'es-AR' },
        provideHttpClient(withInterceptorsFromDi())
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
