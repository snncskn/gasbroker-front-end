import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { merge, Observable, Subject } from "rxjs";
import { debounceTime, map, switchMap, takeUntil } from "rxjs/operators";
import { fuseAnimations } from "@fuse/animations";
import {
  InventoryBrand,
  InventoryCategory,
  InventoryPagination,
  InventoryProduct,
  InventoryProperty,
  InventoryVendor,
} from "app/modules/admin/apps/ecommerce/product/product.types";
import { ProductService } from "app/modules/admin/apps/ecommerce/product/product.service";
import { calendarColors } from "app/modules/admin/apps/calendar/sidebar/calendar-colors";
import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Console } from "console";
import { Router } from "@angular/router";

@Component({
  selector: "pList-list",
  templateUrl: "./pList.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class InventoryListComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  products$: Observable<InventoryProduct[]>;

  brands: InventoryBrand[];
  categories: InventoryCategory[];
  filteredProperties: InventoryProperty[];
  flashMessage: "success" | "error" | null = null;
  isLoading: boolean = false;
  pagination: InventoryPagination;
  productsCount: number = 0;
  productsTableColumns: string[] = [
    "code",
    "name",
     "unit",
    // "categories",
    // "images",
    // "currentImageIndex",
    "active",
    "details",
  ];
  searchInputControl: FormControl = new FormControl();
  selectedProduct: InventoryProduct | null = null;
  selectedProductForm: FormGroup;
  properties: InventoryProperty[];
  propertiesEditMode: boolean = false;
  vendors: InventoryVendor[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  calendarColors: any = calendarColors;
  dataSourceUnits: any[];

  totalSize$: Observable<any>;
  totalPage$: Observable<any>;

  public currentPage = 1;
  public pageSize = 10;
  public filter: string;



  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _productService: ProductService,
    private readonly ngxService: NgxUiLoaderService,
    private _inventoryService: ProductService
  ) {}

  ngOnInit(): void {
    // Create the selected product form
    this.selectedProductForm = this._formBuilder.group({
      id: [""],
      code: [""],
      name: [""],
      unit: [""],
      // properties: [[]],
      // categories: [[]],
      images: [[]],
      currentImageIndex: [0],
      active: [true],
    });

    this._productService.getUnits().subscribe((res) => {
      this.dataSourceUnits = res.body;
    });
    // Get the pagination
    this._inventoryService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pagination: InventoryPagination) => {
        // Update the pagination
        this.pagination = pagination;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.properties$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((properties: InventoryProperty[]) => {
        // Update the properties
        this.properties = properties;
        this.filteredProperties = properties;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this.isLoading = true;
    this.ngxService.start();

    // Get the products
    this.products$ = this._inventoryService.products$;
    this._inventoryService.products$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((products: InventoryProduct[]) => {
        // Update the counts
        this.productsCount = products.length;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.isLoading = false;
    this.ngxService.stop();

    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(300),
        switchMap((query) => {
          this.closeDetails();
          this.isLoading = true;
          return this._inventoryService.getProducts(
            1,
            10,
            "name",
            "asc",
            query
          );
        }),
        map(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // If the user changes the sort order...
    this._sort.sortChange
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.closeDetails();
      });

    // Get products if sort or page changes
    merge(this._sort.sortChange)
      .pipe(
        switchMap(() => {
          this.closeDetails();
          this.isLoading = true;
          return this._inventoryService.getProducts(
            1,
            100,
            this._sort.active,
            this._sort.direction
          );
        }),
        map(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle product details
   *
   * @param productId
   */
  toggleDetails(productId: string): void {
    // If the product is already selected...
    if (this.selectedProduct && this.selectedProduct.id === productId) {
      // Close the details
      this.closeDetails();
      return;
    }

    // Get the product by id
    this._inventoryService.getProductById(productId).subscribe((product) => {
      // Set the selected product
      this.selectedProduct = product;

      // Fill the form
      this.selectedProductForm.patchValue(product);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Close the details
   */
  closeDetails(): void {
    this.selectedProduct = null;
  }

  /**
   * Cycle through images of selected product
   */
  cycleImages(forward: boolean = true): void {
    // Get the image count and current image index
    const count = this.selectedProductForm.get("images").value.length;
    const currentIndex =
      this.selectedProductForm.get("currentImageIndex").value;

    // Calculate the next and previous index
    const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
    const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

    // If cycling forward...
    if (forward) {
      this.selectedProductForm.get("currentImageIndex").setValue(nextIndex);
    }
    // If cycling backwards...
    else {
      this.selectedProductForm.get("currentImageIndex").setValue(prevIndex);
    }
  }

  /**
   * Toggle the properties edit mode
   */
  togglePropertiesEditMode(): void {
    this.propertiesEditMode = !this.propertiesEditMode;
  }

  /**
   * Filter properties
   *
   * @param event
   */
  filterProperties(event): void {
    // Get the value
    const value = event.target.value.toLowerCase();

    // Filter the properties
    this.filteredProperties = this.properties.filter((property) =>
      property.name.toLowerCase().includes(value)
    );
  }

  /**
   * Filter properties input key down event
   *
   * @param event
   */
  filterPropertiesInputKeyDown(event): void {
    // Return if the pressed key is not 'Enter'
    if (event.key !== "Enter") {
      return;
    }

    // If there is no property available...
    if (this.filteredProperties.length === 0) {
      // Create the property
      this.createProperty(event.target.value);

      // Clear the input
      event.target.value = "";

      // Return
      return;
    }

    // If there is a property...
    const property = this.filteredProperties[0];
    const isPropertyApplied = this.selectedProduct.properties.find(
      (id) => id === property.id
    );

    // If the found property is already applied to the product...
    if (isPropertyApplied) {
      // Remove the property from the product
      this.removePropertyFromProduct(property);
    } else {
      // Otherwise add the property to the product
      this.addPropertyToProduct(property);
    }
  }

  /**
   * Create a new properties
   *
   * @param title
   */
  createProperty(name: string): void {
    const property = {
      name,
    };

    // // Create property on the server
    // this._inventoryService.createProperty(property).subscribe((response) => {
    //   // Add the property to the product
    //   this.addPropertyToProduct(response);
    // });
  }

  /**
   * Update the property name
   *
   * @param property
   * @param event
   */
  updatePropertyName(property: InventoryProperty, event): void {
    // Update the name on the property
    property.name = event.target.value;

    // // Update the property on the server
    // this._inventoryService
    //   .updateProperty(property.id, property)
    //   .pipe(debounceTime(300))
    //   .subscribe();

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Delete the property
   *
   * @param property
   */
  deleteProperty(property: InventoryProperty): void {
    // Delete the property from the server
    // this._inventoryService.deleteProperty(property.id).subscribe();

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Add property to the product
   *
   * @param property
   */
  addPropertyToProduct(property: InventoryProperty): void {
    // Add the property
    this.selectedProduct.properties.unshift(property.id);

    // Update the selected product form
    this.selectedProductForm
      .get("properties")
      .patchValue(this.selectedProduct.properties);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Remove property from the product
   *
   * @param property
   */
  removePropertyFromProduct(property: InventoryProperty): void {
    // Remove the property
    this.selectedProduct.properties.splice(
      this.selectedProduct.properties.findIndex((item) => item === property.id),
      1
    );

    // // Update the selected product form
    this.selectedProductForm
      .get("properties")
      .patchValue(this.selectedProduct.properties);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggle product property
   *
   * @param property
   * @param change
   */
  toggleProductProperty(
    property: InventoryProperty,
    change: MatCheckboxChange
  ): void {
    if (change.checked) {
      this.addPropertyToProduct(property);
    } else {
      this.removePropertyFromProduct(property);
    }
  }

  /**
   * Should the create property button be visible
   *
   * @param inputValue
   */
  shouldShowCreatePropertyButton(inputValue: string): boolean {
    return !!!(
      inputValue === "" ||
      this.properties.findIndex(
        (property) => property.name.toLowerCase() === inputValue.toLowerCase()
      ) > -1
    );
  }

  createProduct(): void {
    this.ngxService.start();
    let tmp = { id: "", code: "", active: "1", name: "" };
    this._inventoryService.createProduct(tmp).subscribe((newProduct) => {
      this.selectedProduct = newProduct.body;
      this.ngxService.stop();
      this.selectedProductForm.patchValue(newProduct.body);

      this._changeDetectorRef.markForCheck();
    });
  }

  updateSelectedProduct(): void {
    // Get the product object
    const product = this.selectedProductForm.getRawValue();
    this.ngxService.start();

    this._inventoryService.updateProduct(product).subscribe(() => {
      this.ngxService.stop();
      // Show a success message
      this.showFlashMessage("success");
    });
  }

  /**
   * Delete the selected product using the form data
   */
  // deleteSelectedProduct(): void
  // {
  //     // Get the product object
  //     const product = this.selectedProductForm.getRawValue();

  //     // Delete the product on the server
  //     this.ngxService.start();

  //     this._inventoryService.deleteProduct(product.id).subscribe(() => {

  //         // Close the details
  //         this.ngxService.stop();

  //         this.closeDetails();
  //     });
  // }

  /**
   * Show flash message
   */
  showFlashMessage(type: "success" | "error"): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {
      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  updateActive() {
    const product = this.selectedProductForm.getRawValue();
    product.active = !product.active;
    this._inventoryService.deleteProduct(product.id).subscribe(() => {
      this.showFlashMessage("success");
    });
  }

  onSearchChange(searchValue: string): void {
    this.products$.forEach((item) => {
      item.forEach((it) => {
        if (it.name.indexOf(searchValue) > 0) {
          merge(searchValue)
            .pipe(
              switchMap(() => {
                this.closeDetails();
                this.isLoading = true;
                return this._inventoryService.getProducts(
                  0,
                  10,
                  "name",
                  "asc",
                  searchValue
                );
              }),
              map(() => {
                this.isLoading = false;
              })
            )
            .subscribe();
        }
      });
    });
  }
  openDetail(id: string) {
    this._router.navigate(["/apps/products/form/" + id]);
  }
  getServerData(event?: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this._inventoryService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter ).subscribe();


}
}
