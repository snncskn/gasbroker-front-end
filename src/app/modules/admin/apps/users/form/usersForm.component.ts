import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabBody } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { stubFalse } from 'lodash';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UsersService } from '../users.service';

@Component({
    selector: 'users-form',
    templateUrl: './usersForm.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersFormComponent implements OnInit {

    usersForm: FormGroup;
    resetPassForm: FormGroup;
    filteredOptions: Observable<string[]>;
    selectCustomerItem: any;
    isNew = false;



    constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        public toastr: ToastrManager,
        private _router: Router,
        private _usersService: UsersService,
        private readonly activatedRouter: ActivatedRoute,


    ) {
        this.usersForm = this._formBuilder.group({
            id: [''],
            name: [''],
            email: [''],
            username: [''],
            password: [''],
            confirmPassword: [''],
            website: [''],
        });

        this.resetPassForm = this._formBuilder.group({
            id: [''],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        })

        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._usersService.getUsersById(params.get("id")).subscribe(data => {
                    this.usersForm.patchValue({
                        id: data.body.id,
                        name: data.body.name,
                        email: data.body.email,
                        username: data.body.username,
                        website: data.body.website,
                    });
                    this.resetPassForm.patchValue({
                        id: data.body.id
                    })
                })
                this.isNew = true;
            };
        });
    }

    ngOnInit(): void {

    }

    saveUsers() {
        if (this.usersForm.value.id) {
            let saveUser = {
                id: '', name: '', email: '', username: '', website: ''
            };
            saveUser.id = this.usersForm.value.id
            saveUser.name = this.usersForm.value.name
            saveUser.email = this.usersForm.value.email
            saveUser.username = this.usersForm.value.username
            saveUser.website = this.usersForm.value.website

            this._usersService.updateUser(this.usersForm.value.id, saveUser).subscribe(data => {
                this.toastr.successToastr("User updated", "Updated!");
                this._router.navigateByUrl('/apps/users/list');
            });
        }
        else {
            if (this.usersForm.value.password === this.usersForm.value.confirmPassword) {
                if (!this.usersForm.value.password) {
                    this.toastr.errorToastr("Password cannot be empty", "Check your password!");
                }
                else {
                    let addUser = {
                        id: '', name: '', email: '', username: '', website: '', password: ''
                    };
                    addUser.name = this.usersForm.value.name
                    addUser.email = this.usersForm.value.email
                    addUser.username = this.usersForm.value.username
                    addUser.website = this.usersForm.value.website
                    addUser.password = this.usersForm.value.password

                    this._usersService.createUser(addUser).subscribe(data => {
                        this.toastr.successToastr("User added", "Added!");

                        this._router.navigateByUrl('/apps/users/list');
                    });
                }
            }
            else {
                this.toastr.errorToastr("Password does not match", "Check your password!");
            }
        }
    }

    deleteUser() {
        if (this.usersForm.value.id) {
            this._usersService.deleteUser(this.usersForm.value.id).subscribe()
        }
    }

    resetPassword() {
        if (this.resetPassForm.value.password === this.resetPassForm.value.confirmPassword) {
            let resetPass = {
                id: '', password: ''
            };
            resetPass.id = this.usersForm.value.id
            resetPass.password = this.usersForm.value.password

            this._usersService.updateUser(this.usersForm.value.id, resetPass).subscribe(data => {
                this.toastr.successToastr("Password changed", "Changed!");
                this._router.navigateByUrl('/apps/users/list');
            });
        }
        else {
            this.toastr.errorToastr("Password does not match", "Check your password!");
        }
    }
}
