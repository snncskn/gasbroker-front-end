import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Customer, Country, Tag } from 'app/modules/admin/apps/customers/customers.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    // Private
    private _customer: BehaviorSubject<Customer | null> = new BehaviorSubject(null);
    private _customers: BehaviorSubject<Customer[] | null> = new BehaviorSubject(null);
    private _customersCount: BehaviorSubject<any | null> = new BehaviorSubject(null);



    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        public toastr: ToastrManager
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for customer
     */
    get customer$(): Observable<Customer> {
        return this._customer.asObservable();
    }

    /**
     * Getter for customers
     */
    get customers$(): Observable<Customer[]> {
        return this._customers.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._customersCount.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */
    getCustomers(): Observable<Customer[]> {

        return this._httpClient.get<any>(`${environment.url}/company`).pipe(
            tap((customers) => {
                this._customers.next(customers.body);
                this._customersCount = customers.body.length;
            })
        );
    }

    getTypes():
        Observable<any> {
        let url = `${environment.url}/parameter/category/COMPANY_TYPE`;
            return this._httpClient.get<any>(url);
    }

    /**
     * Search customers with given query
     *
     * @param query
     */
    searchCustomers(query: string): Observable<Customer[]> {
        let filter = { card_name: query, card_code: query, email: query };
        let where = { filter, pageNumber: 9999, pageSize: 20, sortField: '', sortOrder: '' };

        return this._httpClient.post<any>(`${environment.url}/company/find`, { queryParams: where }).pipe(
            tap((customers) => {
                this._customers.next(customers.data);
            })
        );
    }

    /**
     * Get customer by id
     */
    getCustomerById(id: string): Observable<Customer> {
        return this._customers.pipe(
            take(1),
            map((customers) => {
                const customer = customers.find(item => item.id === id) || null;
console.log(2222)
                this._customer.next(customer);

                return customer;
            }),
            switchMap((customer) => {

                if (!customer) {
                    return throwError('Could not found customer with id of ' + id + '!');
                }

                return of(customer);
            })
        );
    }

    /**
     * Create customer
     */
    createCustomer(): Observable<any> {

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
    }

    /**
     * Update customer
     *
     * @param id
     * @param customer
     */
    updateCustomer(id: string, customer: Customer): Observable<any> {
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.put<any>(`${environment.url}/company/${id}`, customer).pipe(
                map((updatedCustomer) => {
                    const index = customers.findIndex(item => item.id === id);
                    console.log(123)
                    customers[index] = updatedCustomer.body;
                    this._customers.next(customers);

                    return updatedCustomer.body;
                }),
                switchMap(updatedCustomer => this.customer$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the customer if it's selected
                        this._customer.next(updatedCustomer);

                        // Return the updated customer
                        return updatedCustomer;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the customer
     *
     * @param id
     */
    deleteCustomer(id: string): Observable<boolean> {
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.delete(`${environment.url}/customers/${id}`).pipe(
                map((isDeleted: any) => {
                    if (isDeleted.success) {
                        // Find the index of the deleted customer
                        const index = customers.findIndex(item => item.id === id);

                        // Delete the customer
                        customers.splice(index, 1);

                        // Update the customers
                        this._customers.next(customers);

                        // Return the deleted status
                    } else {
                        this.toastr.errorToastr(isDeleted.message);
                    }

                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Update the avatar of the given customer
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: string, avatar: File): Observable<Customer> {
        const formData = new FormData();
        let headers = new Headers();

        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        formData.append("file", avatar);
        let tmp = {};
        return this._httpClient.post<any>(
            `${environment.url}/files/avatar/`, formData);
    }
}
