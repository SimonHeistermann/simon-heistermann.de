import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Defines server-side rendering routes configuration.
 */
export const serverRoutes: ServerRoute[] = [
  {
    /**
     * Wildcard route to catch all unmatched paths.
     */
    path: '**',

    /**
     * Specifies that this route should be prerendered on the server.
     */
    renderMode: RenderMode.Prerender
  }
];

