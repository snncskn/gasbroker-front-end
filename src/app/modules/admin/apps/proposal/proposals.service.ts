import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Customer, Country, Tag } from 'app/modules/admin/apps/customers/customers.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Proposal } from './proposals.types';

@Injectable({
    providedIn: 'root'
})
export class ProposalService {
    // Private
    private _proposal: BehaviorSubject<Proposal | null> = new BehaviorSubject(null);
    private _proposals: BehaviorSubject<Proposal[] | null> = new BehaviorSubject(null);
    private _proposalsCount: BehaviorSubject<any | null> = new BehaviorSubject(null);



    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        public toastr: ToastrManager
    ) {
    }
    proposals = [];

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for customer
     */
    get proposal$(): Observable<Proposal> {
        return this._proposal.asObservable();
    }

    /**
     * Getter for customers
     */
    get proposals$(): Observable<Proposal[]> {
        return this._proposals.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._proposalsCount.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get customers
     */
    getProposals(): Observable<Proposal[]> {

        return this._httpClient.get<any>(`${environment.url}/proposal`).pipe(
            tap((proposals) => {
                this._proposals.next(proposals.body);
                this._proposalsCount = proposals.body.length;
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
        return this._httpClient.post<any>(`${environment.url}/proposal/find`, { queryParams: searchObject })
            .pipe(tap(data => {
                return this.proposals = data.body
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
    searchProposal(query: string): Observable<Customer[]> {
        let filter = { name: query };
        let where = { filter, pageNumber: 9999, pageSize: 20, sortField: '', sortOrder: '' };

        return this._httpClient.post<any>(`${environment.url}/company/find`, { queryParams: where }).pipe(
            tap((proposals) => {
                this._proposal.next(proposals.body);
            })
        );
    }

    /**
     * Get customer by id
     */
    getVehicleById(id: string): Observable<Proposal> {
        return this._proposals.pipe(
            take(1),
            map((proposals) => {
                const proposal = proposals.find(item => item.id === id) || null;
                this._proposal.next(proposal);

                return proposal;
            }),
            switchMap((vehicle) => {

                if (!vehicle) {
                    return throwError('Could not found vehicle with id of ' + id + '!');
                }

                return of(vehicle);
            })
        );
    }


    createProposal(item: any): Observable<any> {
        return this.proposals$.pipe(
            take(1),
            switchMap(proposals => this._httpClient.post<any>(`${environment.url}/proposal`, item).pipe(
                map((newVehicle) => {

                    this._proposals.next([newVehicle.body, ...proposals]);

                    return newVehicle.body;
                })
            ))
        );
    }

    newVehicle(): Observable<any> {
        const today = new Date();

        return this.proposals$.pipe(
            take(1),
            switchMap(vehicles => this._httpClient.get<any>(`${environment.url}/vehicle`).pipe(
                map((newVehicle) => {
                    let new1 = { id: 'new', company_id: '', name: '', type: '', registered_date: today.toString() }
                    this._proposals.next([new1, ...vehicles]);

                    return new1;
                })
            ))
        );


    }


    updateVehicle(id: string, proposal: Proposal): Observable<any> {
        return this.proposals$.pipe(
            take(1),
            switchMap(proposals => this._httpClient.put<any>(`${environment.url}/proposal/${id}`, proposal).pipe(
                map((updatedVehicle) => {
                    const index = proposals.findIndex(item => item.id === id);
                    proposals[index] = updatedVehicle.body;
                    this._proposals.next(proposals);

                    return updatedVehicle.body;
                }),
                switchMap(updatedVehicle => this.proposal$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the customer if it's selected
                        this._proposals.next(updatedVehicle);

                        // Return the updated customer
                        return updatedVehicle;
                    })
                ))
            ))
        );
    }

    getProposalTypes():
        Observable<any> {
        let url = `${environment.url}/parameter/category/PROPOSAL_TYPES`;
        return this._httpClient.get<any>(url);
    }
    getProposalStatus():
        Observable<any> {
        let url = `${environment.url}/parameter/category/PROPOSAL_STATUS`;
        return this._httpClient.get<any>(url);
    }
    getProposalDocs():
        Observable<any> {
        let url = `${environment.url}/parameter/category/PROPOSAL_DOCS`;
        return this._httpClient.get<any>(url);
    }
    getPaymentTypes():
        Observable<any> {
        let url = `${environment.url}/parameter/category/PAYMENT_TYPES`;
        return this._httpClient.get<any>(url);
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
