import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Server-specific Angular application configuration.
 * Provides server rendering and server routing capabilities.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes)
  ]
};

/**
 * Merged application configuration combining the base app config
 * with server-specific settings.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
