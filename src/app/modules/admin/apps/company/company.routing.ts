import { Routes, RouterModule } from '@angular/router';
import { CustomersCustomerResolver, CustomersResolver } from 'app/modules/admin/apps/company/company.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/company/company.component';
import { CustomersListComponent } from 'app/modules/admin/apps/company/list/list.component';
import { CustomersTDComponent } from './tabDetails/companyTD.component';
import { NgModule } from '@angular/core';

export const customersRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: CustomersListComponent,
      },
      {
        path: 'form/:id',
        component: CustomersTDComponent,
      },
      {
        path: 'form',
        component: CustomersTDComponent,
      }
 
];

@NgModule({
    imports: [RouterModule.forChild(customersRoutes)],
    exports: [RouterModule]
  })
  export class CompanyRoutingModule {}
