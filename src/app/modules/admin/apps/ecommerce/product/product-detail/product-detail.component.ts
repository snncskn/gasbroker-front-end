import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { Observable } from "rxjs";
import { ProductService } from "../product.service";
import { MatDialog } from '@angular/material/dialog';
import { MailboxComposeComponent } from "../compose/compose.component";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-product-detail",
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  productForm: FormGroup;
  dataSourceUnits: any[];
  productDetail: string;
  customers: any[];
  filteredOptions: Observable<string[]>;
  selectCustomerItem: any;

  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private _productService: ProductService,
    public toastr: ToastrManager,
    private _router: Router,
    private readonly activatedRouter: ActivatedRoute,
    private _matDialog: MatDialog,
  ) {
    this.productForm = this._formBuilder.group({
      id: [""],
      code: ["", [Validators.required]],
      name: ["", [Validators.required]],
      created_at: [null],
      deleted_at: [null],
      updated_at: [null],
      unit: ["", [Validators.required]],
      // properties: [[]],
      // categories: [[]],
      // images: [[]],
      // currentImageIndex: [0],
      // active: [true],
    });

    this._productService.getUnits().subscribe((res) => {
      this.dataSourceUnits = res.body;
    });

    this.activatedRouter.paramMap.subscribe((params) => {
      if (params.has("id")) {
        this._productService
          .getProductById(params.get("id"))
          .subscribe((data) => {
            this.productDetail = data.id;
            this.productForm.patchValue(data);
          });
      }
    });
  }

  ngOnInit(): void {}

  addNewProduct() {
    this._productService.createProduct().subscribe((data) => {
      this._router.navigate(["/apps/products/products"]);
    });
  }

  displayFn(x) {
    return x.full_name;
  }

  deleteProduct() {
    if (this.productDetail) {
      this._productService.deleteProduct(this.productDetail).subscribe();
    }
  }
  onChangeUnit(event) {}

  openComposeDialog(): void {
    // Open the dialog
    const dialogRef = this._matDialog.open(MailboxComposeComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Compose dialog was closed!");
    });
  }
}
