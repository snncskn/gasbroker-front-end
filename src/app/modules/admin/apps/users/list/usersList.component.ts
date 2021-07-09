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
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'app/core/user/user.model';
import { UsersResetComponent } from 'app/modules/admin/apps/users/resetpass/usersReset.component'
import { UsersRolesComponent } from '../roles/usersRoles.component';



@Component({
    selector       : 'usersList-list',
    templateUrl    : './usersList.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class UsersListComponent implements OnInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    users$: Observable<UsersList[]>;

    isLoading: boolean = false;
    pagination: UsersPagination;
    usersCount: number = 0;
    usersTableColumns: string[] = ['color','username','full_name','email','mobilePhone','gender','birthday','post_code','details'];
    selectedUser: UsersList | null = null;
    selectedUserForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    calendarColors: any = calendarColors;


    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _usersService: UsersService,
        public _dialog: MatDialog
    ){}

    ngOnInit(): void
    {
        this.onLoad();
        this.selectedUserForm = this._formBuilder.group({
            id               : [''],
            username         : [''],
            color            : [''], 
            full_name        : [''],
            email            : [''],
            mobilePhone      : [''],
            gender           : [''],
            birthday         : [''],
            address          : [''],
        });

    // Get the users
    this.users$ = this._usersService.users$;
    this._usersService.users$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((users: UsersList[]) => {
            // Update the counts
            this.usersCount = users?.length;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });       
    }
    
    ngAfterViewInit(): void
    {
        // If the user changes the sort order...
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.closeDetails();
            });


        // Get products if sort or page changes
        merge(this._sort.sortChange, ).pipe(
            switchMap(() => {
                this.closeDetails();
                this.isLoading = true;
                return this._usersService.getUsers(1, 10000, this._sort.active, this._sort.direction);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

        /**
     * Toggle user details
     *
     * @param userId
     */
         toggleDetails(userId: string): void
         {
             // If the user is already selected...
             if ( this.selectedUser && this.selectedUser.id === userId )
             {
                 // Close the details
                 this.closeDetails();
                 return;
             }
     
             // Get the user by id
             this._usersService.getUserById(userId)
                 .subscribe((user) => {
     
                     // Set the selected user
                     this.selectedUser = user;
     
                     // Fill the form
                     this.selectedUserForm.patchValue(user);
     
                     // Mark for check
                     this._changeDetectorRef.markForCheck();
             });
         }
     
         /**
          * Close the details
          */
         closeDetails(): void
         {
             this.selectedUser = null;
         }

    onLoad(){
        this._usersService.getUsers(1, 1000, 'username', 'asc', "").subscribe();
    }

    /**
    * Create User
    */
    createUser()
    {
        // Create the user
        this._usersService.createUser().subscribe((newUser) => {

            // Go to new user
            this.selectedUser = newUser.data;

            // Fill the form
            this.selectedUserForm.patchValue(newUser.data);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }
    

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void
    {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

        /**
     * Update the selected user using the form data
     */

    updateSelectedUser(): void
    {
        // Get the user object
        const user = this.selectedUserForm.getRawValue();

        // Update the user on the server
        this._usersService.updateUser(user.id, user).subscribe(() => {

            // Show a success message
            this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected user
     */

    deleteSelectedUser(): void
    {
        // Get the user object
        const user = this.selectedUserForm.getRawValue();

        // Delete the user on the server
        this._usersService.deleteUser(user.id).subscribe(() => {

            // Close the details
            this.closeDetails();
        });
    }
    userResetPasswordDialog(){
        this._dialog.open(UsersResetComponent, {
            data: {
              userId:this.selectedUser.id
            }
          });
    }
    userRolesDialog(){
        this._dialog.open(UsersRolesComponent,{
            data:{
                userId:this.selectedUser.id
            }
        });
    }

}