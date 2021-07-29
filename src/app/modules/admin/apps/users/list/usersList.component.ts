import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersPagination, UsersList } from 'app/modules/admin/apps/users/users.types';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { calendarColors } from 'app/modules/admin/apps/calendar/sidebar/calendar-colors';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';



@Component({
    selector: 'usersList-list',
    templateUrl: './usersList.component.html',
    styleUrls: ['./usersList.component.scss'],

    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class UsersListComponent implements OnInit {

    dialogRef: MatDialogRef<ConfirmationDialog>;

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
    menus: any[];

    totalSize$: Observable<any>;
    totalPage$: Observable<any>;
    public currentPage = 1;
    public pageSize = 10;
    public filter: string;


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
        this._router.navigate(['/apps/users/form/' + item.id])
    }

    deleteUser(item: any) {
        this.dialogRef = this._dialog.open(ConfirmationDialog, {
            disableClose: false
          });
          this.dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this._usersService.deleteUser(item.id).subscribe(data=>{
                    this.onLoad();
                });
            }
            this.dialogRef = null;
          });

    }
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    public setStyle(it: number): string {
        if ((it % 2) === 0) {
            return 'zebra';
        } else {
            return '';
        }
    }

    getServerData(event?: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this._usersService.getUsers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter ).subscribe();


    }
    public applyFilter(filterValue: string) {
        this.filter = filterValue;
        this._usersService.getUsers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, filterValue).subscribe();

    }

}