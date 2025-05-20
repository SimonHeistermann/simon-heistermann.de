import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';

/**
 * Root component of the Angular application.
 * 
 * Contains the router outlet for navigation and the footer component.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  /**
   * Title of the application.
   */
  title = 'portfolio';
}

