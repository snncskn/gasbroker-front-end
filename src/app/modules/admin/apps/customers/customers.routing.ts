import { Route } from '@angular/router';
import { CanDeactivateCustomersDetails } from 'app/modules/admin/apps/customers/customers.guards';
import { CustomersCustomerResolver, CustomersCountriesResolver, CustomersResolver, CustomersTagsResolver } from 'app/modules/admin/apps/customers/customers.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/customers/list/list.component';
import { CustomersDetailsComponent } from 'app/modules/admin/apps/customers/details/details.component';

export const customersRoutes: Route[] = [
    {
        path     : '',
        component: CustomersComponent,
        resolve  : {
            tags: CustomersTagsResolver
        },
        children : [
            {
                path     : '',
                component: CustomersListComponent,
                resolve  : {
                    tasks    : CustomersResolver,
                    countries: CustomersCountriesResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : CustomersDetailsComponent,
                        resolve      : {
                            task     : CustomersCustomerResolver,
                            countries: CustomersCountriesResolver
                        },
                        canDeactivate: [CanDeactivateCustomersDetails]
                    }
                ]
            }
        ]
    }
];
