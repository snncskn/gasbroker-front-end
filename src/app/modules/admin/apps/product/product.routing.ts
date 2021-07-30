import { Route, RouterModule, Routes } from "@angular/router";
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
import { NgModule } from "@angular/core";

export const productRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "list",
  },
  {
    path: "list",
    component: InventoryListComponent,
    resolve: {
      products: ProductsResolver,
    },
  },
  {
    path: "form",
    component: ProductDetailComponent,
    resolve  : {
      products: ProductsResolver
    }
  },
  {
    path: "form/:id",
    component: ProductDetailComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(productRoutes)],
  exports: [RouterModule]
})
export class ProductRoutingModule {}