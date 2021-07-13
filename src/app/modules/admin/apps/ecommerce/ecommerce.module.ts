import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatRippleModule } from "@angular/material/core";
import { MatSortModule } from "@angular/material/sort";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SharedModule } from "app/shared/shared.module";
import { ProductComponent } from "app/modules/admin/apps/ecommerce/product/product.component";
import { InventoryListComponent } from "app/modules/admin/apps/ecommerce/product/list/pList.component";
import { ecommerceRoutes } from "app/modules/admin/apps/ecommerce/ecommerce.routing";
import { ProductDetailComponent } from "./product/product-detail/product-detail.component";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDividerModule } from "@angular/material/divider";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FuseFindByKeyPipeModule } from "@fuse/pipes/find-by-key";
import { FormsModule } from "@angular/forms";
import { MailboxComposeComponent } from "./product/compose/compose.component";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  declarations: [
    ProductComponent,
    InventoryListComponent,
    ProductDetailComponent,
    MailboxComposeComponent,
  ],
  imports: [
    RouterModule.forChild(ecommerceRoutes),
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSortModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
    SharedModule,
    MatTabsModule,
    MatDividerModule,
    MatSidenavModule,
    MatSnackBarModule,
    FuseFindByKeyPipeModule,
    QuillModule.forRoot(),
    MatDialogModule
  ],
})
export class ECommerceModule {}
