import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { Observable } from "rxjs";
import { ProductService } from "../product.service";
import { MatDialog } from "@angular/material/dialog";
import { MailboxComposeComponent } from "../compose/compose.component";
import { map, startWith } from "rxjs/operators";
import { ProductForm } from "../productForm";

@Component({
  selector: "app-product-detail",
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  productForm: FormGroup;
  formSubProduct: FormGroup;
  dataSourceUnits: any[];
  selectedUnit: any;
  productDetail: string;
  customers: any[];
  filteredOptions: Observable<string[]>;
  selectCustomerItem: any;
  subProductForm: any;
  public productsForm = new ProductForm();
  selectProductItem: any;
  products: any[];
  unit:any;
  name:any;
  code:any;




  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private _productService: ProductService,
    public toastr: ToastrManager,
    private _router: Router,
    private readonly activatedRouter: ActivatedRoute,
    private _matDialog: MatDialog
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

    this.subProductForm = {
      id: '', main_id: '', name: '', code: '', unit: '', product:''
  }
  this.formSubProduct = this.productsForm.convertModelToFormGroup(this.subProductForm);

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

    this.list()
  }

  ngOnInit(): void {}

  add(item?: any) {
    const subProductForm = this._formBuilder.group({
        //product: item.product || '',
        main_id: this.productForm.value.id,
        id: item.id || '',
        quantity:item.quantity || '',
    });
    this.subProductItems.push(subProductForm);
}

get subProductItems() {
    return this.formSubProduct.controls["subProductItems"] as FormArray;
}

  addNewProduct() {
    this._productService.createProduct(this.productForm.value).subscribe((data) => {
      console.log(123)
      this.productDetail = data.body.id
      this.toastr.successToastr('Product saved', 'Saved!');
      this.subProductItems.value.forEach(element => {
          element.main_id = this.productDetail;
          element.name=this.name;
          element.code=this.code;
          element.unit=this.unit
          this._productService.createProduct(element).subscribe()
      });
      this._router.navigate(["/apps/products/products"]);
    });
  }

  displayFn(product) {
    return product.name;
  }

  deleteProduct() {
    if (this.productDetail) {
      this._productService.deleteProduct(this.productDetail).subscribe(data=>{
      this._router.navigate(["/apps/products/products"]);

      });
    }
  }
  onChangeUnit(event) {
    console.log(event.value);
    this.selectedUnit = event.value;
  }

  openComposeDialog(): void {
    // Open the dialog
    const dialogRef = this._matDialog.open(MailboxComposeComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Compose dialog was closed!");
    });
  }

    /**
   * Show the products
   *
   * @param event
   */
     selectProduct(event: any) {
      let option = this.products.filter(
        (product) =>
          product.name.toUpperCase() === event.option.value.name.toUpperCase()
      );
      if (option.length > 0) {
        this.selectProductItem = option[0];
        this.formSubProduct.get("id").setValue(option[0].id, { emitEvent: false });
      }
      this.unit=event.option.value.unit;
      this.name=event.option.value.name;
      this.code=event.option.value.code;

    }

    public list() {
      this._productService.getProductAll().subscribe((res) => {
        this.products = res.body;
        this.filteredOptions = this.formSubProduct.controls[
          "product"
        ].valueChanges.pipe(
          startWith(""),
          map((value) => this._filter(value === "" ? "99" : value))
        );
      });
    }
  
    private _filter(value: string): string[] {
      let filterValue;
      if (value === "99") {
        filterValue = "";
      } else {
        filterValue = value;
      }
  
      return this.products.filter((option) => {
        if (typeof filterValue === "object") {
          return (
            option?.name?.indexOf(filterValue.name) === 0 ||
            option?.name?.indexOf(filterValue.name?.toLowerCase()) === 0 ||
            option?.name?.indexOf(filterValue.name?.toUpperCase()) === 0
          );
        } else {
          return (
            option?.name?.indexOf(filterValue) === 0 ||
            option?.name?.indexOf(filterValue?.toLowerCase()) === 0 ||
            option?.name?.indexOf(filterValue?.toUpperCase()) === 0
          );
        }
      });
    }
}
