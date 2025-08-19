import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// Registro manual del Service Worker (solo en producción)
if (environment.production && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('ngsw-worker.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.error('Error al registrar el Service Worker:', err));
  });
}
