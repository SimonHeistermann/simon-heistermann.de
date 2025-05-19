import { Routes } from '@angular/router';

export const LEGAL_ROUTES: Routes = [
  {
    path: 'legal-notice',
    loadComponent: () => import('./legal-notice/legal-notice.component').then(m => m.LegalNoticeComponent),
    title: 'Legal Notice'
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy'
  }
];