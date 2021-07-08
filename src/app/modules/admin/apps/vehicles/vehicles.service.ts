import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Customer, Country, Tag } from 'app/modules/admin/apps/customers/customers.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Vehicle } from './vehicles.types';

@Injectable({
    providedIn: 'root'
})
export class VehiclesService {
    // Private
    private _vehicle: BehaviorSubject<Vehicle | null> = new BehaviorSubject(null);
    private _vehicles: BehaviorSubject<Vehicle[] | null> = new BehaviorSubject(null);
    private _vehiclesCount: BehaviorSubject<any | null> = new BehaviorSubject(null);



    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        public toastr: ToastrManager
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */
    getVehicles(): Observable<Vehicle[]> {

        return this._httpClient.get<any>(`${environment.url}/vehicle`).pipe(
            tap((vehicles) => {
                this._vehicles.next(vehicles.body);
                this._vehiclesCount = vehicles.body.length;
            })
        );
    }

    public CustomersFind(search: string): Observable<any> {
        let searchObject ={
            filter: {full_name:search},
            pageNumber:1,
            pageSize:10,
            sortField:'full_name',
            sortOrder:'asc'
        } 
        return this._httpClient.post<any>(`${environment.url}/company/find`,{queryParams:searchObject})
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
    searchVehicles(query: string): Observable<Customer[]> {
        let filter = { name: query };
        let where = { filter, pageNumber: 9999, pageSize: 20, sortField: '', sortOrder: '' };

        return this._httpClient.post<any>(`${environment.url}/company/find`, { queryParams: where }).pipe(
            tap((vehicles) => {
                this._vehicles.next(vehicles.body);
            })
        );
    }

    /**
     * Get customer by id
     */
    getVehicleById(id: string): Observable<Vehicle> {
        return this._vehicles.pipe(
            take(1),
            map((vehicles) => {
                const vehicle = vehicles.find(item => item.id === id) || null;
                this._vehicle.next(vehicle);

                return vehicle;
            }),
            switchMap((vehicle) => {

                if (!vehicle) {
                    return throwError('Could not found vehicle with id of ' + id + '!');
                }

                return of(vehicle);
            })
        );
    }

        /**
     * Create customer
     */
         createVehicle(): Observable<any> {
            const today = new Date();
            let new1 = { name: '', type: '', registered_date:today }
            return this.vehicles$.pipe(
                take(1),
                switchMap(vehicles => this._httpClient.post<any>(`${environment.url}/vehicle`, new1).pipe(
                    map((newVehicle) => {
    
                        this._vehicles.next([newVehicle.body, ...vehicles]);
    
                        return newVehicle.body;
                    })
                ))
            );
        }

        /**
     * Update vehicle
     *
     * @param id
     * @param vehicle
     */
         updateVehicle(id: string, vehicle: Vehicle): Observable<any> {
            return this.vehicles$.pipe(
                take(1),
                switchMap(vehicles => this._httpClient.put<any>(`${environment.url}/vehicle/${id}`, vehicle).pipe(
                    map((updatedVehicle) => {
                        const index = vehicles.findIndex(item => item.id === id);
                        console.log(123)
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
