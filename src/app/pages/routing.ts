import { Routes } from '@angular/router';
import { TableSkeletonComponent } from '@components/table-skeleton/table-skeleton/table-skeleton.component';
import { BillingsComponent } from './billings/billings.component';
import { BusinessComponent } from './business/business.component';
import { OrderManagementComponent } from './order-management/order-management.component';
import { ProfileComponent } from './profile/profile.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SecurityComponent } from './security/security.component';
import { SingleReviewComponent } from './single-review/single-review.component';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'crafted/pages/profile',
    loadChildren: () =>
      import('../modules/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'crafted/account',
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
    loadChildren: () =>
      import('../modules/widgets-examples/widgets-examples.module').then(
        (m) => m.WidgetsExamplesModule
      ),
  },
  {
    path: 'apps/chat',
    loadChildren: () =>
      import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
  },

  {
    path: 'order-management',
    component: OrderManagementComponent
  },
  {
    path: 'billings',
    component: BillingsComponent
  },
  {
    path: 'table',
    component: TableSkeletonComponent
  },
  {
    path: 'reviews',
    component: ReviewsComponent,
  },
  {
    path: 'reviews/:reviewId',
    component: SingleReviewComponent,
  },
  {
    path: 'single-review/:dealId',
    component: SingleReviewComponent
  },
  {
    path: 'business-page',
    component: BusinessComponent
  },
  {
    path: 'profile-page',
    component: ProfileComponent
  },
  {
    path: 'security-page',
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

