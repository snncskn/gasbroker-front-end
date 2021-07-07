import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Moment } from 'moment';
import { environment } from 'environments/environment';
import moment from 'moment'; 
import { Invoices } from './invoicing.types';

@Injectable({
    providedIn: 'root'
})
export class InvoicingService
{
    private _invoices: BehaviorSubject<Invoices[] | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient)
    {
    }

    public Customers(): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/customers/list`);
    }

    get invoices$(): Observable<Invoices[]>
    {
        return this._invoices.asObservable();
    }

    createInvoice(invoice: any): Observable<any>
    {

        let url = `${environment.url}/invoices/save`;
        return this.invoices$.pipe(
            take(1),
            switchMap(invoices => this._httpClient.post<any>(url, {invoices:invoice}).pipe(
                map((newInvoices) => {

                    this._invoices.next([newInvoices.data, ...invoices]);

                    return newInvoices;
                })
            ))
        );
    }
}