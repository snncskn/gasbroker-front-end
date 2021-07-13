import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    // Private
    private _company: BehaviorSubject<Company | null> = new BehaviorSubject(null);
    private _companys: BehaviorSubject<Company[] | null> = new BehaviorSubject(null);
    private _companysCount: BehaviorSubject<any | null> = new BehaviorSubject(null);



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
    get customer$(): Observable<Company> {
        return this._company.asObservable();
    }

    /**
     * Getter for customers
     */
    get customers$(): Observable<Company[]> {
        return this._companys.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._companysCount.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */
    getCustomers(): Observable<Company[]> {

        return this._httpClient.get<any>(`${environment.url}/company`).pipe(
            tap((customers) => {
                this._companys.next(customers.body);
                this._companysCount = customers.body.length;
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
    searchCustomers(query: string): Observable<Company[]> {
        let filter = { card_name: query, card_code: query, email: query };
        let where = { filter, pageNumber: 9999, pageSize: 20, sortField: '', sortOrder: '' };

        return this._httpClient.post<any>(`${environment.url}/company/find`, { queryParams: where }).pipe(
            tap((customers) => {
                this._companys.next(customers.data);
            })
        );
    }

    /**
     * Get customer by id
     */
    getCustomerById(id: string): Observable<Company> {
        return this._companys.pipe(
            take(1),
            map((customers) => {
                const customer = customers.find(item => item.id === id) || null;
                this._company.next(customer);

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

    getCompanyById(id: string): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/company/${id}`)
    }

    /**
     * Create customer
     */
    createCustomer(item: any): Observable<any> {
        if (item.id) {
            return this.customers$.pipe(
                take(1),
                switchMap(customers => this._httpClient.put<any>(`${environment.url}/company/${item.id}`, item).pipe(
                    map((newCustomer) => {
                        this.toastr.successToastr('Vehicle Updated', 'Updated!');

                        return newCustomer.body;
                    })
                ))
            );
        }
        else {
            return this.customers$.pipe(
                take(1),
                switchMap(customers => this._httpClient.post<any>(`${environment.url}/company/`, item).pipe(
                    map((newCustomer) => {
                        this.toastr.successToastr('Vehicle Added', 'Added!');

                        return newCustomer.body;
                    })
                ))
            );
        }
    }

    /**
     * Update customer
     *
     * @param id
     * @param customer
     */
    updateCustomer(id: string, customer: Company): Observable<any> {
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.put<any>(`${environment.url}/company/${id}`, customer).pipe(
                map((updatedCustomer) => {
                    const index = customers.findIndex(item => item.id === id);
                    customers[index] = updatedCustomer.body;
                    this._companys.next(customers);

                    return updatedCustomer.body;
                }),
                switchMap(updatedCustomer => this.customer$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the customer if it's selected
                        this._company.next(updatedCustomer);

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
     * @param company_id
     */
     deleteCompany(company_id: string): Observable<boolean> {
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.put(`${environment.url}/company/delete/${company_id}`, { company_id }).pipe(
                map((isDeleted: any) => {
                    if (isDeleted.success) {
                        // Find the index of the deleted customer
                        const index = customers.findIndex(item => item.id === company_id);

                        // Delete the customer
                        customers.splice(index, 1);

                        // Update the customers
                        this._companys.next(customers);

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
    uploadAvatar(id: string, avatar: File): Observable<Company> {
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
