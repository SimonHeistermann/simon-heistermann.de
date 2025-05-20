import { Routes } from '@angular/router';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { LEGAL_ROUTES } from './features/legal';

/**
 * Application route definitions.
 * 
 * - Default route ('') displays the PortfolioComponent.
 * - Nested legal-related routes are loaded from LEGAL_ROUTES.
 * - Wildcard route redirects to the default path.
 */
export const routes: Routes = [
  { path: '', component: PortfolioComponent },

  {
    path: '',
    children: LEGAL_ROUTES
  },

  { path: '**', redirectTo: '' }
];

