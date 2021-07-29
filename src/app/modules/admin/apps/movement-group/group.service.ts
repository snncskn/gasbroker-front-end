import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Group } from './group.types';
import { InventoryPagination } from '../product/product.types';
@Injectable({
    providedIn: 'root'
})
export class GroupService {
    // Private
    private _group: BehaviorSubject<Group | null> = new BehaviorSubject(null);
    private _groups: BehaviorSubject<Group[] | null> = new BehaviorSubject(null);
    private _groupCount: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _totalSize: BehaviorSubject<number | null> = new BehaviorSubject(null);
    private _totalPage: BehaviorSubject<number | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);




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
    get group$(): Observable<Group> {
        return this._group.asObservable();
    }

    /**
     * Getter for customers
     */
    get groups$(): Observable<Group[]> {
        return this._groups.asObservable();
    }

    get getCount$(): Observable<any> {
        return this._groupCount.asObservable();
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

    getGroup(page: number = 0, size: number = 5, sort: string = 'created_at', order: 'asc' | 'desc' | '' = 'asc', search: string = ''): 
    Observable<Group[]> {

        return this._httpClient.get<any>(`${environment.url}/process-group?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`).pipe(
            tap((groups) => {
                this._groups.next(groups.body);
                this._groupCount = groups.body.length;
                this._totalSize = groups.totalSize;
                this._totalPage = groups.totalPage;
            })
        );
    }

    getGroupById(id: string): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/process-group/${id}`)
    }

    deleteGroup(item:any):
        Observable<any> {
        let url = `${environment.url}/process-group/delete/${item.id}`;
        return this._httpClient.put<any>(url,item);
    }

    deleteSubGroup(item:any):
    Observable<any> {
    let url = `${environment.url}/process-sub-group/delete/${item.id}`;
    return this._httpClient.put<any>(url,item);
    }

    createProcessGroup(item: any): Observable<any> {
        let url = `${environment.url}/process-group/`;
        if(item.id)
        {
            return this._httpClient.put<any>(url+item.id, item);
        }
        else
        {
            return this._httpClient.post<any>(url, item);
        }
    }

    createProcessSubGroup(item: any): Observable<any> {
        let url = `${environment.url}/process-sub-group/`;
        if(item.id)
        {
            return this._httpClient.put<any>(url+item.id, item);
        }
        else
        {
            return this._httpClient.post<any>(url, item);
        }
    }

    getProcessDelete(item: any): Observable<any> {
        let url = `${environment.url}/process/delete/${item.id}`;
        return this._httpClient.put<any>(url, item);
    }


}
