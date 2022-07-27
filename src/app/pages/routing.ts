import { Routes } from '@angular/router';
import { TableSkeletonComponent } from '@components/table-skeleton/table-skeleton/table-skeleton.component';
import { CanActivateGuard } from '../modules/auth/services/can-activate.guard';
import { BillingsComponent } from './billings/billings.component';
import { BusinessComponent } from './business/business.component';
import { NewReviewsComponent } from './new-reviews/new-reviews.component';
import { OrderManagementComponent } from './order-management/order-management.component';
import { ProfileComponent } from './profile/profile.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SecurityComponent } from './security/security.component';
import { SingleReviewComponent } from './single-review/single-review.component';

const Routing: Routes = [
  {
    path: 'dashboard',
    canActivate: [CanActivateGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'crafted/pages/profile',
    canActivate: [CanActivateGuard],
    loadChildren: () =>
      import('../modules/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'crafted/account',
    canActivate: [CanActivateGuard],
    loadChildren: () =>
      import('../modules/account/account.module').then((m) => m.AccountModule),
  },
  {
    path: 'deals',
    loadChildren: () =>
      import('../modules/wizards/deals.module').then((m) => m.DealsModule),
  },
  {
    path: 'crafted/widgets',
    canActivate: [CanActivateGuard],
    loadChildren: () =>
      import('../modules/widgets-examples/widgets-examples.module').then(
        (m) => m.WidgetsExamplesModule
      ),
  },
  {
    path: 'apps/chat',
    canActivate: [CanActivateGuard],
    loadChildren: () =>
      import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
  },

  {
    path: 'order-management',
    canActivate: [CanActivateGuard],
    component: OrderManagementComponent
  },
  {
    path: 'billings',
    canActivate: [CanActivateGuard],
    component: BillingsComponent
  },
  {
    path: 'table',
    canActivate: [CanActivateGuard],
    component: TableSkeletonComponent
  },
  {
    path: 'reviews',
    canActivate: [CanActivateGuard],
    component: ReviewsComponent,
  },
  {
    path: 'new-reviews',
    canActivate: [CanActivateGuard],
    component: NewReviewsComponent
  },
  {
    path: 'reviews/:reviewId',
    canActivate: [CanActivateGuard],
    component: SingleReviewComponent,
  },
  {
    path: 'single-review/:dealId',
    canActivate: [CanActivateGuard],
    component: SingleReviewComponent
  },
  {
    path: 'business-page',
    canActivate: [CanActivateGuard],
    component: BusinessComponent
  },
  {
    path: 'profile-page',
    canActivate: [CanActivateGuard],
    component: ProfileComponent
  },
  {
    path: 'security-page',
    canActivate: [CanActivateGuard],
    component: SecurityComponent
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };

