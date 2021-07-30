import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { catchError, filter, first, map, switchMap, take, tap } from "rxjs/operators";
import {
  UsersList,
  UsersPagination,
  UsersRoles,
} from "app/modules/admin/apps/users/users.types";
import { environment } from "environments/environment";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  // Private
  private _pagination: BehaviorSubject<UsersPagination | null> =
    new BehaviorSubject(null);
  private _user: BehaviorSubject<UsersList | null> = new BehaviorSubject(null);
  private _users: BehaviorSubject<UsersList[] | null> = new BehaviorSubject(
    null
  );
  private _roles: BehaviorSubject<UsersRoles[] | null> = new BehaviorSubject(
    null
  );
  private _usersCount: BehaviorSubject<any | null> = new BehaviorSubject(null);
  private _totalSize: BehaviorSubject<number | null> = new BehaviorSubject(null);
  private _totalPage: BehaviorSubject<number | null> = new BehaviorSubject(null);


  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient, private _router: Router, public toastr: ToastrManager,
    private translocoService: TranslocoService) { }

  get pagination$(): Observable<UsersPagination> {
    return this._pagination.asObservable();
  }

  get getTotalSize$(): Observable<any> {
    return this._totalSize;
}

get getTotalPage$(): Observable<any> {
    return this._totalPage;
}

  get user$(): Observable<UsersList> {
    return this._user.asObservable();
  }

  get getCount$(): Observable<any> {
    return this._usersCount.asObservable();
  }

  get users$(): Observable<UsersList[]> {
    return this._users.asObservable();
  }

  get roles$(): Observable<UsersRoles[]> {
    return this._roles.asObservable();
  }


  getUsers(
    page: number = 0,
    size: number = 10,
    sort: string = "created_at",
    order: "asc" | "desc" | "" = "asc",
    search: string = ""
  ): Observable<any> {
    /*let url = `${environment.url}/api/user`;
    
    return this._httpClient
      .post<{ pagination: UsersPagination; users: UsersList[] }>(url, {
        queryParams: {
          pageNumber: "" + page,
          pageSize: "" + size,
          sortField: sort,
          sortOrder: order,
          filter: { username: search },
        },
      })

      */
    return this._httpClient.get<any>(`${environment.url}/api/user?page=${page}&size=${size}&sortBy=${sort}&sortType=${order}&filter=${search}`).pipe(
      tap((customers) => {
        this._users.next(customers.body);
        this._usersCount = customers.body.length;
        this._pagination.next(customers.body);
        this._totalSize = customers.totalSize;
        this._totalPage = customers.totalPage;
      })
    );
  }

  getUsersById(id: string): Observable<any> {
    return this._httpClient.get<any>(`${environment.url}/api/user/${id}`)
  }

  getRoles(userId?: string): Observable<any> {
    let url = `${environment.url}/roles`;
    if (userId) {
      return this._httpClient.get<any>(url + "/" + userId);
    } else {
      return this._httpClient.get<any>(url);
    }
  }

  getUserInfo(): Observable<any> {
    let url = `${environment.url}/user/me`;

    return this._httpClient.post<any>(url, {}).pipe(
      tap((response) => {
        this._users.next(response.user);
      })
    );
  }

  roleSave(roleUser: any): Observable<any> {
    let url = `${environment.url}/roles/save`;

    return this._httpClient.post<any>(url, roleUser);
  }
  roleDelete(roleUser: any): Observable<any> {
    let url = `${environment.url}/roles/delete/${roleUser.user_id}/${roleUser.role_id}`;

    return this._httpClient.delete<any>(url, roleUser);
  }
  /**
   * Get user by id
   */
  getUserById(id: string): Observable<UsersList> {
    return this._users.pipe(
      take(1),
      map((users) => {
        const user = users.find((item) => item.id === id) || null;
        this._user.next(user);
        return user;
      }),
      switchMap((user) => {
        if (!user) {
          return throwError("Could not found user with id of " + id + "!");
        }

        return of(user);
      })
    );
  }

  /**
   * Create user
   */
  createUser(user: any): Observable<any> {
    let url = `${environment.url}/api/user/`;
    return this._httpClient.post<any>(url, user);
  }

  createUserSingUp(user: any): Observable<any> {
    let url = `${environment.url}/api/auth/signup`;
    return this.users$
      .pipe(
        take(1),
        switchMap((users) =>
          this._httpClient.post<any>(url, user).pipe(
            map((newUser) => {

              return newUser;
            })
          )
        )
      )
      .pipe(first());
  }

  /**
   * Update user
   *
   * @param id
   * @param user
   */
  updateUser(id: string, user: any): Observable<UsersList> {
    return this._httpClient.put<any>(`${environment.url}/api/user/${id}`, user)
      .pipe(
        map((updatedUser) => {
          this.toastr.successToastr(this.translocoService.translate('message.updateUser'));
          this._router.navigateByUrl('/apps/users/list');
        }),
        switchMap((updatedUser) =>
          this.user$.pipe(
            take(1),
            filter((item) => item && item.id === id),
            tap(() => { })
          )
        )
      );
  }

  /**
   * Update user
   *
   * @param id
   * @param user
   */
  updateUserProfile(id: string, user: UsersList): Observable<UsersList> {
    let url = `${environment.url}user/${id}`;

    return this.users$.pipe(
      take(1),
      switchMap((users) =>
        this._httpClient.put<any>(`${environment.url}/api/user/${id}`, user)
          .pipe(
            map((updatedUser) => {
              this.toastr.successToastr(this.translocoService.translate('message.updateUser'));
            }),
            switchMap((updatedUser) =>
              this.user$.pipe(
                take(1),
                filter((item) => item && item.id === id),
                tap(() => { })
              )
            )
          )
      )
    );
  }

  updatePass(id: string, user: UsersList): Observable<UsersList> {
    let url = `${environment.url}passuser/${id}`;

    return this.users$.pipe(
      take(1),
      switchMap((users) =>
        this._httpClient
          .put<any>(url, {
            id,
            user,
          })
          .pipe(
            map((updatedUser) => {
              this.toastr.successToastr(this.translocoService.translate('message.passChanged'));
            }),
            switchMap((updatedUser) =>
              this.user$.pipe(
                take(1),
                filter((item) => item && item.id === id),
                tap(() => { })
              )
            )
          )
      )
    );
  }
  getMenus(): Observable<any> {
    let url = `${environment.url}/menu`;
    return this._httpClient.get<any>(url);
  }

  deleteUser(id: string): Observable<boolean> {
    return this.users$.pipe(
      take(1),
      switchMap(users => this._httpClient.put(`${environment.url}/api/user/delete/${id}`, { id }).pipe(
        map((isDeleted: any) => {
          if (isDeleted.success) {
            const index = users.findIndex((item) => item.id === id);

            users.splice(index, 1);

            this._users.next(users);

          } else {
            this.toastr.warningToastr(this.translocoService.translate('message.deleteUsers'));
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
}
