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
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
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

    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]> {
        return this._tags.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */
    getCustomers(): Observable<Customer[]> {
        //api/apps/contacts/all
        //`${environment.url}/users/agent`
        return this._httpClient.get<any>(`${environment.url}/customers/list`).pipe(
            tap((customers) => {
                this._customers.next(customers.data);
                this._customersCount = customers.records;
            })
        );
    }

    /**
     * Search customers with given query
     *
     * @param query
     */
    searchCustomers(query: string): Observable<Customer[]> {
        let filter = { card_name: query, card_code: query, email: query };
        let where = { filter, pageNumber: 9999, pageSize: 20, sortField: '', sortOrder: '' };

        return this._httpClient.post<any>(`${environment.url}/customers/find`, { queryParams: where }).pipe(
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

        let new1 = { birthday: '', gender: '', phone: '', card_name: '', status: '', email: '', tax_no: '', tax_name: '' }
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.post<any>(`${environment.url}/customers/save`, new1).pipe(
                map((newCustomer) => {

                    this._customers.next([newCustomer.data, ...customers]);

                    return newCustomer.data;
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
            switchMap(customers => this._httpClient.put<any>(`${environment.url}/customers/${id}`, customer).pipe(
                map((updatedCustomer) => {
                    const index = customers.findIndex(item => item.id === id);
                    customers[index] = updatedCustomer.data;
                    this._customers.next(customers);

                    return updatedCustomer.data;
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
     * Get countries
     */
    getCountries(): Observable<Country[]> {
        return this._httpClient.get<Country[]>('api/apps/contacts/countries').pipe(
            tap((countries) => {
                this._countries.next(countries);
            })
        );
    }

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]> {
        return this._httpClient.get<Tag[]>('api/apps/contacts/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            })
        );
    }

    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<Tag>('api/apps/contacts/tag', { tag }).pipe(
                map((newTag) => {

                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                })
            ))
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<Tag>('api/apps/contacts/tag', {
                id,
                tag
            }).pipe(
                map((updatedTag) => {

                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                })
            ))
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/contacts/tag', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.customers$.pipe(
                    take(1),
                    map((customers) => {

                        // Iterate through the customers
                        customers.forEach((customer) => {

                            const tagIndex = customer.tags.findIndex(tag => tag === id);

                            // If the customer has the tag, remove it
                            if (tagIndex > -1) {
                                customer.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
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
                    `${environment.url}/files/avatar/`,formData);
    }
}
