import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersPagination, UsersList } from 'app/modules/admin/apps/users/users.types';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { calendarColors } from 'app/modules/admin/apps/calendar/sidebar/calendar-colors';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
    selector: 'usersList-list',
    templateUrl: './usersList.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class UsersListComponent implements OnInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    users$: Observable<UsersList[]>;

    isLoading: boolean = false;
    pagination: UsersPagination;
    usersCount: number = 0;
    usersTableColumns: string[] = ['name', 'username', 'email', 'website', 'detail'];
    selectedUser: UsersList | null = null;
    selectedUserForm: FormGroup;
    calendarColors: any = calendarColors;
    drawerMode: 'side' | 'over';



    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _usersService: UsersService,

        public _dialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,

    ) {
        this.onLoad();
    }

    ngOnInit(): void {
        this.selectedUserForm = this._formBuilder.group({
            id: [''],
            username: [''],
            email: [''],
            name: [''],
        });

        this.users$ = this._usersService.users$;
        this._usersService.users$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((users: UsersList[]) => {
                // Update the counts
                this.usersCount = users?.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._usersService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: UsersList) => {
                // Update the counts
                this.selectedUser = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        // If the user changes the sort order...
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
            });
        // Get products if sort or page changes
        merge(this._sort.sortChange,).pipe(
            switchMap(() => {
                this.isLoading = true;
                return this._usersService.getUsers();
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    onLoad() {
        this._usersService.getUsers().subscribe();
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
    * Create User
    */
    createUser() {
        this._router.navigate(['/apps/users/form']);
    }

    openUser(item: any) {
        console.log(item)
        this._router.navigate(['/apps/users/form/' + item.id])
    }

    deleteUser(item: any) {
        this._usersService.deleteUser(item.id).subscribe()
    }
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}