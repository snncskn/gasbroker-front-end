import { Route } from '@angular/router';
import { CanDeactivateCustomersDetails } from 'app/modules/admin/apps/customers/customers.guards';
import { CustomersCustomerResolver, CustomersResolver } from 'app/modules/admin/apps/customers/customers.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/customers/list/list.component';
import { CustomersDetailsComponent } from 'app/modules/admin/apps/customers/details/details.component';
import { CustomersTDComponent } from './tabDetails/customersTD.component';

export const customersRoutes: Route[] = [
    {
        path     : '',
        component: CustomersComponent,
        resolve  : {
        },
        children : [
          
            {
                path     : '',
                component: CustomersListComponent,
                resolve  : {
                    tasks    : CustomersResolver,
                    
                },
                children : [
                   
                    {
                        path         : ':id',
                        component    : CustomersDetailsComponent,
                        resolve      : {
                            task     : CustomersCustomerResolver,
                            
                        },
                        canDeactivate: [CanDeactivateCustomersDetails],
                    },
                
                ]
            }
        ]
    },
    {
        path     : '/detail/:id',
        component: CustomersTDComponent,
    }
    
];
