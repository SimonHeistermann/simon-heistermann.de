import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Bootstraps the Angular application using the root AppComponent
 * and the provided application configuration.
 *
 * @returns A promise that resolves when the application is bootstrapped.
 */
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;

