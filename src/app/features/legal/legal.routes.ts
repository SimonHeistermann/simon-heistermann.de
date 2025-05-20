import { Routes } from '@angular/router';

/**
 * Route configuration for the legal section of the application.
 *
 * This constant defines lazy-loaded routes for:
 * - The Legal Notice page (`/legal-notice`)
 * - The Privacy Policy page (`/privacy-policy`)
 *
 * Each route uses dynamic `loadComponent` imports to optimize bundle size.
 */
export const LEGAL_ROUTES: Routes = [
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./legal-notice/legal-notice.component').then(m => m.LegalNoticeComponent),
    title: 'Legal Notice'
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy'
  }
];
