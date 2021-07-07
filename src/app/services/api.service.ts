import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly endpoint = 'Parameters';

  constructor(
    private readonly httpClient: HttpClient
  ) {

  }

  public Customers(): Observable<any> {
    return this.httpClient.get<any>(`${environment.url}/customers/list`);

  }

  public Products(item: any): Observable<any> {
    return this.httpClient.post<any>(`${environment.url}/products/find`,{queryParams:item});

  }

  public GetParametersByGroupId(id: string): Observable<any> {
   return this.httpClient.get<any>(`${environment.url}${this.endpoint}/GetParametersByGroupId/${id}`);
  }

   
}

