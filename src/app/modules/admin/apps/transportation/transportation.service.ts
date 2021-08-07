import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Process } from './transportation.types';
import { items } from 'app/mock-api/apps/file-manager/data';
import { InventoryPagination } from '../product/product.types';
import { TranslocoService } from '@ngneat/transloco';
@Injectable({
    providedIn: 'root'
})
export class ProcessService {
    // Private
    private _process: BehaviorSubject<Process | null> = new BehaviorSubject(null);
    private _processes: BehaviorSubject<Process[] | null> = new BehaviorSubject(null);
    private _processesCount: BehaviorSubject<any | null> = new BehaviorSubject(null);
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

    getProcess(page: number = 0, size: number = 5, sort: string = 'created_at', order: 'asc' | 'desc' | '' = 'asc', search: string = ''): 
    Observable<any> {

        return this._httpClient.get<any>(`${environment.url}/process?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`).pipe(
            tap((processes) => {
                this._processes.next(processes.body);
                this._pagination.next(processes.body);
                this._totalSize = processes.totalSize;
                this._totalPage = processes.totalPage;
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

    getProcessGroupById(id: any):
        Observable<any> {
        let url = `${environment.url}/process-group/${id}`;
        return this._httpClient.get<any>(url);
    }
    getProcessSave(item: any):
        Observable<any> {
        if (item.id === '') {
            delete item.id;
            let url = `${environment.url}/process/`;
            return this._httpClient.post<any>(url, item);
        }else{
            let url = `${environment.url}/process/${item.id}`;
            return this._httpClient.put<any>(url, item);
        }

      
    }
    getProcessDelete(item: any):
        Observable<any> {
        let url = `${environment.url}/process/delete/${item.id}`;
        return this._httpClient.put<any>(url, item).pipe(
            catchError((error)=>{
                if(error instanceof HttpErrorResponse && error.status == 601)
                {
                    this.toastr.errorToastr(this.translocoService.translate('message.error.601'));
                }
                else
                {
                    this.toastr.warningToastr(this.translocoService.translate('message.deleteProcess'));
                }
                return throwError(error);
            })
        )
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
