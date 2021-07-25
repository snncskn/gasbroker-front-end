import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { environment } from "environments/environment";
import { Media } from "./media.types";

@Injectable({
  providedIn: "root",
})
export class MediaService {
  private _medias: BehaviorSubject<Media | null> = new BehaviorSubject(null);

  /**
   * Getter for customers
   */
  get medias$(): Observable<Media> {
    return this._medias.asObservable();
  }
  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  /**
   * Get customers
   */
  getCustomers(
    page: number = 0,
    size: number = 5,
    sort: string = "name",
    order: "asc" | "desc" | "" = "asc",
    search: string = ""
  ): Observable<any> {
    return this._httpClient
      .get<any>(
        `${environment.url}/media?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`
      )
      .pipe(
        tap((medias) => {
          /***/
        })
      );
  }

  /**
   * Create customer
   */
  create(item: Media): Observable<any> {
    if (item.id) {
      return this.medias$.pipe(
        take(1),
        map(() =>
          this._httpClient
            .put<any>(`${environment.url}/media/${item.id}`, item)
            .pipe(
              map((newMedia) => {
                return newMedia.body;
              })
            )
        )
      );
    } else {
      return this.medias$.pipe(
        take(1),
        map(() =>
          this._httpClient.post<any>(`${environment.url}/media/`, item).pipe(
            map((newMedia) => {
              return newMedia.body;
            })
          )
        )
      );
    }
  }
}
