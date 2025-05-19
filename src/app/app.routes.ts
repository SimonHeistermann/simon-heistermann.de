import { Routes } from '@angular/router';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { LEGAL_ROUTES } from './features/legal';

export const routes: Routes = [
    { path: '', component: PortfolioComponent },
    {
        path: '',
        children: LEGAL_ROUTES
    },
    { path: '**', redirectTo: '' }
];
