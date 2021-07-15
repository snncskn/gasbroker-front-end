import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Process } from './transportation.types';
@Injectable({
    providedIn: 'root'
})
export class ProcessService {
    // Private
    private _process: BehaviorSubject<Process | null> = new BehaviorSubject(null);
    private _processes: BehaviorSubject<Process[] | null> = new BehaviorSubject(null);
    private _processesCount: BehaviorSubject<any | null> = new BehaviorSubject(null);



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
    get process$(): Observable<Process> {
        return this._process.asObservable();
    }

    /**
     * Getter for customers
     */
    get processes$(): Observable<Process[]> {
        return this._processes.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._processesCount.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getProcess(): Observable<Process[]> {

        return this._httpClient.get<any>(`${environment.url}/process`).pipe(
            tap((processes) => {
                this._processes.next(processes.body);
                this._processesCount = processes.body.length;
            })
        );
    }

    getProcessById(id: string): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/process/${id}`)
    }

    getProcessGroup():
        Observable<any> {
        let url = `${environment.url}/process-group`;
        return this._httpClient.get<any>(url);
    }

    getProcessGroupById(id:any):
        Observable<any> {
        let url = `${environment.url}/process-group/${id}`;
        return this._httpClient.get<any>(url);
    }
    getProcessSave(item:any):
        Observable<any> {
        let url = `${environment.url}/process/`;
        return this._httpClient.get<any>(url,item);
    }
    getProcessDelete(item:any):
        Observable<any> {
        let url = `${environment.url}/process/${item.id}`;
        return this._httpClient.put<any>(url,item);
    }

    getCustomers():
        Observable<any> {
        let url = `${environment.url}/company`;
        return this._httpClient.get<any>(url);
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
}
