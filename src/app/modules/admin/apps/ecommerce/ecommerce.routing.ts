import { Route } from '@angular/router';
import { ProductComponent } from 'app/modules/admin/apps/ecommerce/product/product.component';
import { InventoryListComponent } from 'app/modules/admin/apps/ecommerce/product/list/pList.component';
import {
  InventoryBrandsResolver,
  InventoryCategoriesResolver,
  InventoryProductsResolver,
  InventoryPropertiesResolver,
  InventoryVendorsResolver,
} from "app/modules/admin/apps/ecommerce/product/product.resolvers";
import { ProductDetailComponent } from './product/product-detail/product-detail.component';

export const ecommerceRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'products'
    },
    {
        path: 'form',
        component: ProductDetailComponent,
      },
    {
        path     : 'products',
        component: ProductComponent,
        children : [
            {
                path     : '',
                component: InventoryListComponent,
                resolve  : {
                    brands    : InventoryBrandsResolver,
                    categories: InventoryCategoriesResolver,
                    products  : InventoryProductsResolver,
                    properties      : InventoryPropertiesResolver,
                    vendors   : InventoryVendorsResolver
                }
            }
        ]
        /*children : [
            {
                path     : '',
                component: ContactsListComponent,
                resolve  : {
                    tasks    : ContactsResolver,
                    countries: ContactsCountriesResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : ContactsDetailsComponent,
                        resolve      : {
                            task     : ContactsContactResolver,
                            countries: ContactsCountriesResolver
                        },
                        canDeactivate: [CanDeactivateContactsDetails]
                    }
                ]
            }
        ]*/
    }
];
