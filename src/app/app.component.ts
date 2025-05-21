import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FaviconService } from './core/services/favicon-service/favicon.service';

/**
 * Root component of the Angular application.
 *
 * It contains the router outlet for rendering routed components
 * and includes the footer component shared across all pages.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent implements OnInit {
  /**
   * Title of the application.
   */
  title = 'portfolio';

  /**
   * Constructs the AppComponent.
   * 
   * @param faviconService Service for dynamically switching the favicon
   */
  constructor(private faviconService: FaviconService) {}

  /**
   * Lifecycle hook called once the component is initialized.
   * 
   * Initializes the favicon switcher logic.
   */
  ngOnInit(): void {
    this.faviconService.setupFaviconSwitcher();
  }
}


