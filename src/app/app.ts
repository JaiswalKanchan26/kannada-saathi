import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PreferencesService } from './core/services/preferences.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`
    :host {
      display: block;
      min-height: 100dvh;
    }
  `],
})
export class App implements OnInit {
  constructor(private prefs: PreferencesService) {}

  ngOnInit(): void {
    this.prefs.listenSystemTheme();
  }
}
