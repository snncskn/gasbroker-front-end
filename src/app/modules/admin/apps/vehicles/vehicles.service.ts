import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Vehicle } from './vehicles.types';
import { TranslocoService } from '@ngneat/transloco';
import { InventoryPagination } from '../product/product.types';

@Injectable({
    providedIn: 'root'
})
export class VehiclesService {
    // Private
    private _vehicle: BehaviorSubject<Vehicle | null> = new BehaviorSubject(null);
    private _vehicles: BehaviorSubject<Vehicle[] | null> = new BehaviorSubject(null);
    private _vehiclesCount: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _totalSize: BehaviorSubject<number | null> = new BehaviorSubject(null);
    private _totalPage: BehaviorSubject<number | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);



    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        public toastr: ToastrManager,
        private translocoService: TranslocoService
    ) {
    }
    customers = [];

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for customer
     */
    get vehicle$(): Observable<Vehicle> {
        return this._vehicle.asObservable();
    }

    /**
     * Getter for customers
     */
    get vehicles$(): Observable<Vehicle[]> {
        return this._vehicles.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._vehiclesCount.asObservable();
    }

    get pagination$(): Observable<InventoryPagination>
    {
        return this._pagination.asObservable();
    }
    get getTotalSize$(): Observable<any> {
        return this._totalSize;
    }
    
    get getTotalPage$(): Observable<any> {
        return this._totalPage;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */     
     getVehicles(page: number = 0, size: number = 5, sort: string = 'created_at', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
     Observable<any>{

        return this._httpClient.get<any>(`${environment.url}/vehicle?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`).pipe(
            tap((vehicles) => {
                this._vehicles.next(vehicles.body);
                this._totalSize = vehicles.totalSize;
                this._totalPage = vehicles.totalPage;
            })
        );
    }

    public CustomersFind(search: string): Observable<any> {
        let searchObject = {
            filter: { full_name: search },
            pageNumber: 1,
            pageSize: 10,
            sortField: 'full_name',
            sortOrder: 'asc'
        }
        return this._httpClient.post<any>(`${environment.url}/company/find`, { queryParams: searchObject })
            .pipe(tap(data => {
                return this.customers = data.body
            }));

    }

    getTypes():
        Observable<any> {
        let url = `${environment.url}/parameter/category/VEHICLE_TYPE`;
        return this._httpClient.get<any>(url);
    }


    getCustomers():
        Observable<any> {
        let url = `${environment.url}/company`;
        return this._httpClient.get<any>(url);
    }

    /**
     * Search customers with given query
     *
     * @param query
     */
    searchVehicles(query: string): Observable<Company[]> {
        let filter = { name: query };
        let where = { filter, pageNumber: 9999, pageSize: 20, sortField: '', sortOrder: '' };

        return this._httpClient.post<any>(`${environment.url}/company/find`, { queryParams: where }).pipe(
            tap((vehicles) => {
                this._vehicles.next(vehicles.body);
            })
        );
    }

    getVehicleById(id: string): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/vehicle/${id}`)
    }


    createVehicle(item: any): Observable<any> {
        if (item.id) {
            return this.vehicles$.pipe(
                take(1),
                switchMap(customers => this._httpClient.put<any>(`${environment.url}/vehicle/${item.id}`, item).pipe(
                    map((newVehicle) => {
                        this.toastr.successToastr(this.translocoService.translate('message.updateVehicle'));

                        return newVehicle.body;
                    })
                ))
            );
        }
        else {
            return this.vehicles$.pipe(
                take(1),
                switchMap(customers => this._httpClient.post<any>(`${environment.url}/vehicle/`, item).pipe(
                    map((newVehicle) => {
                        this.toastr.successToastr(this.translocoService.translate('message.createdVehicle'));

                        return newVehicle.body;
                    })
                ))
            );
        }
    }

    newVehicle(): Observable<any> {
        const today = new Date();

        return this.vehicles$.pipe(
            take(1),
            switchMap(vehicles => this._httpClient.get<any>(`${environment.url}/vehicle`).pipe(
                map((newVehicle) => {
                    let new1 = { id: 'new', company_id: '', name: '', type: '', registered_date: today.toString() }
                    this._vehicles.next([new1, ...vehicles]);

                    return new1;
                })
            ))
        );


    }


    updateVehicle(id: string, vehicle: Vehicle): Observable<any> {
        return this.vehicles$.pipe(
            take(1),
            switchMap(vehicles => this._httpClient.put<any>(`${environment.url}/vehicle/${id}`, vehicle).pipe(
                map((updatedVehicle) => {
                    const index = vehicles.findIndex(item => item.id === id);
                    vehicles[index] = updatedVehicle.body;
                    this._vehicles.next(vehicles);

                    return updatedVehicle.body;
                }),
                switchMap(updatedVehicle => this.vehicle$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the customer if it's selected
                        this._vehicle.next(updatedVehicle);

                        // Return the updated customer
                        return updatedVehicle;
                    })
                ))
            ))
        );
    }

        /**
     * Delete the customer
     *
     * @param vehilce_id
     */
         deleteVehicle(vehilce_id: string): Observable<boolean> {
            return this.vehicles$.pipe(
                take(1),
                switchMap(vehicles => this._httpClient.put(`${environment.url}/vehicle/delete/${vehilce_id}`, { vehilce_id }).pipe(
                   
                    map((isDeleted: any) => {
                        if (isDeleted.success) { 
                            // Find the index of the deleted customer
                            const index = vehicles.findIndex(item => item.id === vehilce_id);
    
                            // Delete the customer
                            vehicles.splice(index, 1);
    
                            // Update the customers
                            this._vehicles.next(vehicles);
    
                            // Return the deleted status
                        }
                        else
                        {
                            this.toastr.warningToastr(this.translocoService.translate('message.deleteCompany'));
                        }
                        return isDeleted;
                    })
                )),
                catchError((error)=>{
                    if(error instanceof HttpErrorResponse && error.status == 601)
                    {
                        this.toastr.errorToastr(this.translocoService.translate('message.error.601'));
                    }
                    return throwError(error);
                })
            );
        }

    /**
     * Create customer
     */
    /*createCustomer(): Observable<any> {

        let new1 = { full_name: '', name: '', phone: '', fax: '', types: [], email: '', registered_date: null}
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.post<any>(`${environment.url}/company/`, new1).pipe(
                map((newCustomer) => {

                    this._customers.next([newCustomer.body, ...customers]);

                    return newCustomer.body;
                })
            ))
        );
    }*/
}
