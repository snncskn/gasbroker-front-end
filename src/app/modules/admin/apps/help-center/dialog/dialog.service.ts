import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { DialogFaq } from './dialog.component';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DialogService {
    private _dialogs: ReplaySubject<DialogFaq[]> = new ReplaySubject<DialogFaq[]>(1);

    constructor(private _httpClient: HttpClient)
    {
    }

    getDialog(): Observable<DialogFaq> 
    {
        let url = `${environment.url}/help-center/faqs`;
        return this._httpClient.get<DialogFaq>(url)
            .pipe(
                tap((response: any) => {
                    this._dialogs.next(response);
                })
            )
    }


}