import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Proposal, ProposalOffer } from './proposals.types';
import { TranslocoService } from '@ngneat/transloco';
import { InventoryPagination } from '../product/product.types';

@Injectable({
    providedIn: 'root'
})
export class ProposalService {
    // Private
    private _proposal: BehaviorSubject<Proposal | null> = new BehaviorSubject(null);
    private _proposals: BehaviorSubject<Proposal[] | null> = new BehaviorSubject(null);
    private _process: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _process_items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _processes: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _proposalsCount: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _offers: BehaviorSubject<ProposalOffer[] | null> = new BehaviorSubject(null);
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
    get pagination$(): Observable<InventoryPagination>
    {
        return this._pagination.asObservable();
    }
    /**
     * Getter for customers
     */
    get proposals$(): Observable<Proposal[]> {
        return this._proposals.asObservable();
    }

    get process$(): Observable<any> {
        return this._process.asObservable();
    }

    get processes$(): Observable<any[]> {
        return this._processes.asObservable();
    }

    get process_items$(): Observable<any[]> {
        return this._process_items.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._proposalsCount.asObservable();
    }

    get offers$(): Observable<ProposalOffer[]> {
        return this._offers.asObservable();
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
    getProposals(page: number = 0, size: number = 5, sort: string = 'created_at', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
    Observable<any> {

        return this._httpClient.get<any>(`${environment.url}/proposal?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`).pipe(
            tap((proposals) => {
                this._proposals.next(proposals.body);
                this._pagination.next(proposals.body);
                this._proposalsCount = proposals.body.length;
                this._totalSize = proposals.totalSize;
                this._totalPage = proposals.totalPage;
            })
        );
    }

    getProposalById(id:any):
    Observable<any> {
    let url = `${environment.url}/proposal/${id}`;
    return this._httpClient.get<any>(url);
    }

    getProcessByProposalId(id:any): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/process/processes/${id}`)
    }

    getOffers(id: any): Observable<ProposalOffer[]> {

        return this._httpClient.get<any>(`${environment.url}/offer/offers/${id}`).pipe(
            tap((offers) => {
                this._offers.next(offers.body);
                this._proposalsCount = offers.body.length;
            })
        );
    }

    getProcessGroup():
    Observable<any> {
    let url = `${environment.url}/process-group`;
    return this._httpClient.get<any>(url);
    }

    getProcessGroupById(id: any):
    Observable<any> {
    let url = `${environment.url}/process-group/${id}`;
    return this._httpClient.get<any>(url);
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

    getCurrency():
    Observable<any> {
    let url = `${environment.url}/parameter/category/CURRENCY_TYPES`;
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
    searchProposal(query: string): Observable<Company[]> {
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


    createProposal(item: any, isSubmit:boolean): Observable<any> {
        if(item.id)
        {
            return this.proposals$.pipe(
                take(1),
                switchMap(proposals => this._httpClient.put<any>(`${environment.url}/proposal/`+item.id, item).pipe(
                    map((newVehicle) => {
    
                        //this._proposals.next([newVehicle.body, ...proposals]);
                        if(isSubmit)
                        {
                            this.toastr.successToastr(this.translocoService.translate('message.updateProposal'));
                        }
                        return newVehicle.body;
                    })
                ))
            );
        }
        else
        {
            return this.proposals$.pipe(
                take(1),
                switchMap(proposals => this._httpClient.post<any>(`${environment.url}/proposal`, item).pipe(
                    map((newVehicle) => {
    
                        //this._proposals.next([newVehicle.body, ...proposals]);
                        if(isSubmit)
                        {
                            this.toastr.successToastr(this.translocoService.translate('message.createProposal'));
                        }
                        return newVehicle.body;
                    })
                ))
            );
        }
    }

    createProposalOffer(item: any): Observable<any> {
        return this.offers$.pipe(
            take(1),
            switchMap(offers => this._httpClient.post<any>(`${environment.url}/offer`, item).pipe(
                map((newOffer) => {
                    this.toastr.successToastr(this.translocoService.translate('message.offerReceived'));
                    
                    return newOffer.body;
                })
            ))
        );
    }
    updateProposalOffer(item: any): Observable<any> {
        return this.offers$.pipe(
            take(1),
            switchMap(offers => this._httpClient.put<any>(`${environment.url}/offer/${item.id}`, item).pipe(
                map((newOffer) => {
                    this.toastr.successToastr(this.translocoService.translate('message.offerReceived'));
                    
                    return newOffer.body;
                })
            ))
        );
    }
    createProcess(item: any): Observable<any> {
        if(item.id)
        {
            return this.processes$.pipe(
                take(1),
                switchMap(processes => this._httpClient.put<any>(`${environment.url}/process/`+item.id, item).pipe(
                    map((newProcess) => {
    
                        //this._proposals.next([newVehicle.body, ...proposals]);
                        this.toastr.successToastr(this.translocoService.translate('message.updateProcess'));
                        return newProcess.body;
                    })
                ))
            );
        }
        else
        {
            return this.processes$.pipe(
                take(1),
                switchMap(proposals => this._httpClient.post<any>(`${environment.url}/process`, item).pipe(
                    map((newProcess) => {
    
                        //this._proposals.next([newVehicle.body, ...proposals]);
                        this.toastr.successToastr(this.translocoService.translate('message.savedProcess'));
                        return newProcess.body;
                    })
                ))
            );
        }
    }

    createProcessItem(item: any): Observable<any> {
        if(item.id)
        {
            return this.process_items$.pipe(
                take(1),
                switchMap(processes => this._httpClient.put<any>(`${environment.url}/process-item/`+item.id, item).pipe(
                    map((newProcess) => {
    
                        //this._proposals.next([newVehicle.body, ...proposals]);
                        this.toastr.successToastr(this.translocoService.translate('message.updateProcessItem'));
                        return newProcess.body;
                    })
                ))
            );
        }
        else
        {
            return this.process_items$.pipe(
                take(1),
                switchMap(proposals => this._httpClient.post<any>(`${environment.url}/process-item`, item).pipe(
                    map((newProcess) => {
    
                        //this._proposals.next([newVehicle.body, ...proposals]);
                        this.toastr.successToastr(this.translocoService.translate('message.savedProcessItem'));
                        return newProcess.body;
                    })
                ))
            );
        }
    }

    getProcessItemsByProcessId(id: string): Observable<any> {
        let url = `${environment.url}/process-item/items/${id}`;
        return   this._httpClient.get<any>(url);
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

    deleteProposal(id: string): Observable<boolean> {
        return this.proposals$.pipe(
            take(1),
            switchMap(proposals => this._httpClient.put(`${environment.url}/proposal/delete/${id}`, { id }).pipe(
                map((isDeleted: any) => {
                    if (isDeleted.success) {

                        const index = proposals.findIndex(item => item.id === id);

                        proposals.splice(index, 1);

                        this._proposals.next(proposals);

                    } else {
                        this.toastr.warningToastr(this.translocoService.translate('message.deleteProposal'));
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

    deleteDocs(doc: any): Observable<any>
    {
        let url = `${environment.url}/media/delete/`;
        return this._httpClient.put<any>(url+doc.id, doc).pipe(
            map((newDoc) => {
                this.toastr.successToastr(this.translocoService.translate('message.deleteMedia'));
                return newDoc
            })
        )
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

    deleteProcess(id: string): Observable<boolean> {
        return this.processes$.pipe(
            take(1),
            switchMap(processes => this._httpClient.put(`${environment.url}/process/delete/${id}`, { id }).pipe(
                map((isDeleted: any) => {
                    if (isDeleted.success) {

                        const index = processes.findIndex(item => item.id === id);

                        processes.splice(index, 1);

                        this._processes.next(processes);

                    } else {
                        this.toastr.warningToastr(this.translocoService.translate('message.deleteProcess'));
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

    deleteProcessItem(id: string): Observable<boolean> {
        return this.process_items$.pipe(
            take(1),
            switchMap(process_items => this._httpClient.put(`${environment.url}/process-item/delete/${id}`, { id }).pipe(
                map((isDeleted: any) => {
                    if (isDeleted.success) {

                        const index = process_items.findIndex(item => item.id === id);

                        process_items.splice(index, 1);

                        this._processes.next(process_items);

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
