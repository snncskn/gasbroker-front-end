import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ProductService } from "../product.service";
import {
  InventoryProduct,
  InventoryBrand,
  InventoryCategory,
  InventoryPagination,
  InventoryProperty,
  InventoryVendor,
} from "../product.types";

@Component({
  selector: "mailbox-compose",
  templateUrl: "./compose.component.html",
  encapsulation: ViewEncapsulation.None,
})
export class MailboxComposeComponent implements OnInit {
  productForm: FormGroup;
  //   products$: Observable<InventoryProduct[]>;
  copyFields: { cc: boolean; bcc: boolean } = {
    cc: false,
    bcc: false,
  };
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };
  selectProductItem: any;
  dataSourceProducts: any[];
  dataSourceUnits: any[];
  products: any[];
  filteredOptions: Observable<string[]>;

  /**
   * Constructor
   */
  constructor(
    public matDialogRef: MatDialogRef<MailboxComposeComponent>,
    private _formBuilder: FormBuilder,
    private _productService: ProductService,
    private readonly activatedRouter: ActivatedRoute
  ) {
    // Create the form
    this.productForm = this._formBuilder.group({
      to: ["", [Validators.required, Validators.email]],
      cc: ["", [Validators.email]],
      bcc: ["", [Validators.email]],
      subject: [""],
      body: ["", [Validators.required]],
      product: ["", [Validators.required]],
      quantity: ["", [Validators.required]],
    });
    // this.products$ = this._productService.products$;
    this.list();
    this.dataSourceUnits = [" KM", "M2"];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * filtered
   */
  public list() {
    this._productService.getProductAll().subscribe((res) => {
      this.products = res.body;
      this.filteredOptions = this.productForm.controls[
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

  onChangeUnit(event) {}

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
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
      this.productForm.get("id").setValue(option[0].id, { emitEvent: false });
    }
  }
  displayFn(product) {
    return product.name;
  }
  /**
   * name
   */

  /**
   * Show the copy field with the given field name
   *
   * @param name
   */
  showCopyField(name: string): void {
    // Return if the name is not one of the available names
    if (name !== "cc" && name !== "bcc") {
      return;
    }

    // Show the field
    this.copyFields[name] = true;
  }

  /**
   * Save and close
   */
  saveAndClose(): void {
    // Save the message as a draft
    this.saveAsDraft();

    // Close the dialog
    this.matDialogRef.close();
  }

  /**
   * Discard the message
   */
  discard(): void {}

  /**
   * Save the message as a draft
   */
  saveAsDraft(): void {}

  /**
   * Send the message
   */
  send(): void {}
}
