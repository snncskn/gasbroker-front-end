import { Route } from "@angular/router";
import { ProductComponent } from "app/modules/admin/apps/product/product.component";
import { InventoryListComponent } from "app/modules/admin/apps/product/list/pList.component";
import {
  InventoryBrandsResolver,
  InventoryCategoriesResolver,
  InventoryPropertiesResolver,
  InventoryVendorsResolver,
  ProductsResolver,
} from "app/modules/admin/apps/product/product.resolvers";
import { ProductDetailComponent } from "./product-detail/product-detail.component";

export const productRoutes: Route[] = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "products",
  },
  {
    path: "form",
    component: ProductDetailComponent,
    resolve  : {
      customers: ProductsResolver
    }
  },
  {
    path: "form/:id",
    component: ProductDetailComponent,
  },
  {
    path: "products",
    component: ProductComponent,
    children: [
      {
        path: "",
        component: InventoryListComponent,
        resolve: {
          brands: InventoryBrandsResolver,
          categories: InventoryCategoriesResolver,
          products: ProductsResolver,
          properties: InventoryPropertiesResolver,
          vendors: InventoryVendorsResolver,
        },
      },
    ],
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
  },
];
