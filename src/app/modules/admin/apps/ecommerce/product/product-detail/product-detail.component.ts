import {
  AfterViewInit,
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
import { forkJoin } from 'rxjs';
import { NgxUiLoaderService } from "ngx-ui-loader";
import { TranslocoService } from "@ngneat/transloco";


@Component({
  selector: "app-product-detail",
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit, AfterViewInit  {
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

  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private _productService: ProductService,
    public toastr: ToastrManager,
    private _router: Router,
    private readonly ngxService: NgxUiLoaderService,
    private readonly activatedRouter: ActivatedRoute,
    private _matDialog: MatDialog,
    private translocoService: TranslocoService
  ) {
    this.productForm = this._formBuilder.group({
      id: [""],
      code: ["", [Validators.required]],
      name: ["", [Validators.required]],
      created_at: [null],
      deleted_at: [null],
      updated_at: [null],
      unit: ["", [Validators.required]],
    });

    this.subProductForm = {
      id: '', name: '', code: '', unit: '', product: ''
    }
    this.formSubProduct = this.productsForm.convertModelToFormGroup(this.subProductForm);

    this._productService.getUnits().subscribe((res) => {
      this.dataSourceUnits = res.body;
    });
    this.activatedRouter.paramMap.subscribe((params) => {
      if (params.has("id")) {
        this.ngxService.start();
        let getById =this._productService.getProductWithItemsById(params.get("id"));
        let getProducts =  this._productService.getProductAll();
        forkJoin(getById,getProducts).subscribe(results => {
          this.productDetail = results[0].body.id;
          this.products = results[1].body;
          results[0].body.product_items.forEach(element => {
            this.add(element);
          });
          this.productForm.patchValue(results[0].body);
          this.ngxService.stop();
      });
      }
    });

  }
  ngAfterViewInit(): void {
    this.list();
  }

  ngOnInit(): void { }

  add(item?: any) {
    let option = this.products?.filter((product) => product.name === item.name);
    let tmpProduct;
    if(option?.length>0){
      tmpProduct = option[0];
    }else{
      tmpProduct = {unit: 'KG',name:''};

    }
    const subProductForm = this._formBuilder.group({
      unit: item.unit,
      name: item.name,
      product: tmpProduct,
      product_id: item.product_id || '',
      id: item.id || '',
      quantity: item.quantity || '',
    });
     
    this.subProductItems.push(subProductForm);
  }

  get subProductItems() {
    return this.formSubProduct.controls["subProductItems"] as FormArray;
  }

  addNewProduct() {
    this._productService.createProduct(this.productForm.value).subscribe((data) => {
      
      this.toastr.successToastr(this.translocoService.translate('message.createProduct'));
      this.subProductItems.value.forEach(element => {
        element.id = element.id;
        element.product_id = data.body.id;
        element.quantity = element.quantity;
        element.name = element.name;
        element.unit = element.unit;
        this._productService.createProductItem(element).subscribe()
      });
      this._router.navigate(["/apps/products/products"]);
    });
  }

  displayFn(product) {
    return product.name;
  }

  deleteProduct() {
    if (this.productDetail) {
      this._productService.deleteProduct(this.productDetail).subscribe(data => {
        this._router.navigate(["/apps/products/products"]);

      });
    }
  }

  deleteSubGroup(item: any, index: number) {
    if (item.id) {
      this._productService.deleteSubProduct(item.id).subscribe(data => {
        this.toastr.errorToastr(this.translocoService.translate('message.deleteProcessSubGroup'));
        this._router.navigateByUrl('/apps/group/form/' + data.body.id);
      });
    }
    let tmp = this.formSubProduct.controls["subProductItems"] as FormArray;
    tmp.removeAt(index);

  }


  onChangeUnit(event) {
    this.selectedUnit = event.value;
  }

  openComposeDialog(): void {
    // Open the dialog
    const dialogRef = this._matDialog.open(MailboxComposeComponent);

    dialogRef.afterClosed().subscribe((result) => {
    });
  }
 
  selectProduct(event: any, index: number) {
    let option = this.products.filter(
      (product) =>
        product.name.toUpperCase() === event.option.value.name.toUpperCase()
    );
    if (option.length > 0) {
      this.selectProductItem = option[0];
      let rows = this.formSubProduct.get('subProductItems') as FormArray;
      rows.controls[index].patchValue({product_id:event.option.value.id,unit:event.option.value.unit,name:event.option.value.name});
     }

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
