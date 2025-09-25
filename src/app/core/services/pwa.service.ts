import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installAvailable$ = new BehaviorSubject<boolean>(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      event.preventDefault();

      if (this.isMobileDevice()) {
        this.deferredPrompt = promptEvent;
        this.installAvailable$.next(true);
      } else {
        this.installAvailable$.next(false);
      }
    });
  }

  getInstallAvailableObservable() {
    return this.installAvailable$.asObservable();
  }

  isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  isMobileDevice(): boolean {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(ua);
  }

  async installApp(): Promise<void> {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const choiceResult = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.installAvailable$.next(false);
  }

}
