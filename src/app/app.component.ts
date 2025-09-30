import { Component, OnInit } from '@angular/core';
import { PwaService } from './core/services/pwa.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'casaparts-mobile';

  constructor(private _pwaService: PwaService) { }

  get estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  ngOnInit(): void {
    // const urlWeb: string = "https://test-casaparts.casadelrenault.com/";
    if (!this._pwaService.isStandalone()) {
      console.log("SE REDIRECCIONA A LA WEB");
      // window.location.href = urlWeb;
    }
  }

}