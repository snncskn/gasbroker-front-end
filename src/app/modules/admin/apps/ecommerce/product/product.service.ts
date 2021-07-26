import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import {
  InventoryBrand,
  InventoryCategory,
  InventoryPagination,
  InventoryProduct,
  InventoryProperty,
  InventoryVendor,
} from "app/modules/admin/apps/ecommerce/product/product.types";
import { environment } from "environments/environment";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ToastrManager } from "ng6-toastr-notifications";
import { TranslocoService } from "@ngneat/transloco";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  // Private
  private _brands: BehaviorSubject<InventoryBrand[] | null> =
    new BehaviorSubject(null);
  private _categories: BehaviorSubject<InventoryCategory[] | null> =
    new BehaviorSubject(null);
  private _pagination: BehaviorSubject<InventoryPagination | null> =
    new BehaviorSubject(null);
  private _product: BehaviorSubject<InventoryProduct | null> =
    new BehaviorSubject(null);
  private _products: BehaviorSubject<InventoryProduct[] | null> =
    new BehaviorSubject(null);
  private _properties: BehaviorSubject<InventoryProperty[] | null> =
    new BehaviorSubject(null);
  private _vendors: BehaviorSubject<InventoryVendor[] | null> =
    new BehaviorSubject(null);

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private readonly ngxService: NgxUiLoaderService,
    public toastr: ToastrManager,
    private translocoService: TranslocoService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for brands
   */
  get brands$(): Observable<InventoryBrand[]> {
    return this._brands.asObservable();
  }

  /**
   * Getter for categories
   */
  get categories$(): Observable<InventoryCategory[]> {
    return this._categories.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<InventoryPagination> {
    return this._pagination.asObservable();
  }

  /**
   * Getter for product
   */
  get product$(): Observable<InventoryProduct> {
    return this._product.asObservable();
  }

  /**
   * Getter for products
   */
  get products$(): Observable<InventoryProduct[]> {
    return this._products.asObservable();
  }

  /**
   * Getter for tags
   */
  get properties$(): Observable<InventoryProperty[]> {
    return this._properties.asObservable();
  }

  /**
   * Getter for vendors
   */
  get vendors$(): Observable<InventoryVendor[]> {
    return this._vendors.asObservable();
  }

 

  getAllByMainId(id: string): Observable<any> {
    let url = `${environment.url}/product/${id}`;

    return this._httpClient
      .get<any>(url);
  }

  getBrands(): Observable<InventoryBrand[]> {
    
    return this._httpClient
      .get<InventoryBrand[]>("api/apps/ecommerce/inventory/brands")
      .pipe(
        tap((brands) => {
          this._brands.next(brands);
        })
      );
  }

  /**
   * Get categories
   */
  getCategories(): Observable<InventoryCategory[]> {
    return this._httpClient
      .get<InventoryCategory[]>("api/apps/ecommerce/inventory/categories")
      .pipe(
        tap((categories) => {
          this._categories.next(categories);
        })
      );
  }

  /**
   * Get products
   *
   *
   * @param page
   * @param size
   * @param sort
   * @param order
   * @param search
   */
  getProducts(
    page: number = 0,
    size: number = 10,
    sort: string = "name",
    order: "asc" | "desc" | "" = "asc",
    search: string = ""
  ): Observable<{
    pagination: InventoryPagination;
    products: InventoryProduct[];
  }> {
    let url = `${environment.url}/product?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`;
    //'api/apps/ecommerce/inventory/products'
    return this._httpClient.get<any>(url).pipe(
      tap((response) => {
        // this._pagination.next(response.pagination);
        this._products.next(response.body);
      })
    );
  }

  getProductAll(): Observable<any> {
    let url = `${environment.url}/product`;
    //'api/apps/ecommerce/inventory/products'
    return this._httpClient.get<any>(url);
  }

  /**
   * Get product by id
   */
  getProductById(id: string): Observable<any> {
    return this._products.pipe(
      take(1),
      map((products) => {
        const product = products.find((item) => item.id === id) || null;
        this._product.next(product);
        return product;
      }),
      switchMap((product) => {
        if (!product) {
          return throwError("Could not found product with id of " + id + "!");
        }

        return of(product);
      })
    );
  }
  getProductWithItemsById(id: string): Observable<any> {
    let url = `${environment.url}/product/${id}`;

    return   this._httpClient.get<any>(url);
   }

  /**
   * Create product
   */
  createProduct(item: any): Observable<any> {

    if(item.id)
    {
      let url = `${environment.url}/product/${item.id}`;
      return this.products$.pipe(
        take(1),
        switchMap(() =>
          this._httpClient.put<any>(url, item).pipe(
            map((newProduct) => {
              this._products.next([newProduct.body]);
  
              return newProduct;
            })
          )
        )
      );
    }
    else
    {
      let url = `${environment.url}/product/`;
      return this.products$.pipe(
        take(1),
        switchMap(() =>
          this._httpClient.post<any>(url, item).pipe(
            map((newProduct) => {
              this._products.next([newProduct.body]);
  
              return newProduct;
            })
          )
        )
      );
    }
  }
  createProductItem(item: any): Observable<any> {

    if(item.id)
    {
      let url = `${environment.url}/product-item/${item.id}`;
      return this.products$.pipe(
        take(1),
        switchMap(() =>
          this._httpClient.put<any>(url, item).pipe(
            map((newProduct) => {
              this._products.next([newProduct.body]);
  
              return newProduct;
            })
          )
        )
      );
    }
    else
    {
      let url = `${environment.url}/product-item/`;
      return this.products$.pipe(
        take(1),
        switchMap(() =>
          this._httpClient.post<any>(url, item).pipe(
            map((newProduct) => {
              this._products.next([newProduct.body]);
  
              return newProduct;
            })
          )
        )
      );
    }
  }

  /**
   * Update product
   *
   * @param id
   * @param product
   */
  updateProduct(product: any): Observable<InventoryProduct> {
    let url = `${environment.url}/product/${product.id}`;
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this._httpClient.put<any>(url, product).pipe(
          map((updatedProduct) => {
            const index = products.findIndex((item) => item.id === product.id);
            products[index] = updatedProduct.body;
            this.toastr.successToastr(this.translocoService.translate('message.updateProduct'));

            this._products.next(products);

            this.ngxService.stop();
            return updatedProduct;
          }),
          switchMap((updatedProduct) =>
            this.product$.pipe(
              take(1),
              filter((item) => item && item.id === product.id),
              tap(() => {
                this._product.next(updatedProduct);
                return updatedProduct;
              })
            )
          )
        )
      )
    );
  }

  /**
   * Delete the product
   *
   * @param id
   */
  deleteProduct(id: string): Observable<boolean> {
    let url = `${environment.url}/product/delete/${id}`;

    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this._httpClient.put(url, { params: { id } }).pipe(
          map((isDeleted: any) => {
            if (isDeleted.success) {
              const index = products.findIndex((item) => item.id === id);

              products.splice(index, 1);

              this._products.next(products);
              this.ngxService.stop();
              this.toastr.errorToastr(this.translocoService.translate('message.deleteProduct'));

              return isDeleted.success;
            } else {
              this.toastr.warningToastr(isDeleted.message, "Warning!");
            }
          })
        )
      )
    );
  }

  deleteSubProduct(id: string): Observable<any> {
    let url = `${environment.url}/product-item/delete/${id}`;

    return  this._httpClient.put(url, { params: { id } });
  }

  /**
   * Get properties
   */
  getProperties(): Observable<InventoryProperty[]> {
    return this._httpClient
      .get<InventoryProperty[]>("api/apps/ecommerce/inventory/tags")
      .pipe(
        tap((properties) => {
          this._properties.next(properties);
        })
      );
  }

  /**
   * Create tag
   *
   * @param propertiy
   */
  createTag(propertiy: InventoryProperty): Observable<InventoryProperty> {
    return this.properties$.pipe(
      take(1),
      switchMap((tags) =>
        this._httpClient
          .post<InventoryProperty>("api/apps/ecommerce/inventory/tag", {
            tag: propertiy,
          })
          .pipe(
            map((newTag) => {
              // Update the tags with the new tag
              this._properties.next([...tags, newTag]);

              // Return new tag from observable
              return newTag;
            })
          )
      )
    );
  }

  /**
   * Update the property
   *
   * @param id
   * @param property
   */
  updateProperty(
    id: string,
    property: InventoryProperty
  ): Observable<InventoryProperty> {
    return this.properties$.pipe(
      take(1),
      switchMap((properties) =>
        this._httpClient
          .patch<InventoryProperty>("api/apps/ecommerce/inventory/tag", {
            id,
            tag: property,
          })
          .pipe(
            map((updatedTag) => {
              // Find the index of the updated tag
              const index = properties.findIndex((item) => item.id === id);

              // Update the tag
              properties[index] = updatedTag;

              // Update the tags
              this._properties.next(properties);

              // Return the updated tag
              return updatedTag;
            })
          )
      )
    );
  }

  /**
   * Delete the tag
   *
   * @param id
   */
  // deleteTag(id: string): Observable<boolean>
  // {
  //     return this.tags$.pipe(
  //         take(1),
  //         switchMap(tags => this._httpClient.delete('api/apps/ecommerce/inventory/tag', {params: {id}}).pipe(
  //             map((isDeleted: boolean) => {

  //                 // Find the index of the deleted tag
  //                 const index = tags.findIndex(item => item.id === id);

  //                 // Delete the tag
  //                 tags.splice(index, 1);

  //                 // Update the tags
  //                 this._tags.next(tags);

  //                 // Return the deleted status
  //                 return isDeleted;
  //             }),
  //             filter(isDeleted => isDeleted),
  //             switchMap(isDeleted => this.products$.pipe(
  //                 take(1),
  //                 map((products) => {

  //                     // Iterate through the contacts
  //                     products.forEach((product) => {

  //                         const tagIndex = product.tags.findIndex(tag => tag === id);

  //                         // If the contact has the tag, remove it
  //                         if ( tagIndex > -1 )
  //                         {
  //                             product.tags.splice(tagIndex, 1);
  //                         }
  //                     });

  //                     // Return the deleted status
  //                     return isDeleted;
  //                 })
  //             ))
  //         ))
  //     );
  // }

  /**
   * Get vendors
   */
  getVendors(): Observable<InventoryVendor[]> {
    return this._httpClient
      .get<InventoryVendor[]>("api/apps/ecommerce/inventory/vendors")
      .pipe(
        tap((vendors) => {
          this._vendors.next(vendors);
        })
      );
  }

  getFilterProducts(prm?: string): Observable<any> {
    let url = `${environment.url}/product`;
    return this._httpClient.get<any>(url);
  }

  /**
   * Update the avatar of the given contact
   *
   * @param id
   * @param avatar
   */
  /*uploadAvatar(id: string, avatar: File): Observable<Contact>
    {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Contact>('api/apps/contacts/avatar', {
                id,
                avatar
            }, {
                headers: {
                    'Content-Type': avatar.type
                }
            }).pipe(
                map((updatedContact) => {

                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = updatedContact;

                    // Update the contacts
                    this._contacts.next(contacts);

                    // Return the updated contact
                    return updatedContact;
                }),
                switchMap(updatedContact => this.contact$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._contact.next(updatedContact);

                        // Return the updated contact
                        return updatedContact;
                    })
                ))
            ))
        );
    }*/

  getUnits(): Observable<any> {
    let url = `${environment.url}/parameter/category/UNIT_TYPES`;
    return this._httpClient.get<any>(url);
  }
}
