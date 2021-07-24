import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabBody } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { stubFalse } from 'lodash';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { CustomersService } from '../../company/company.service';
import { UsersService } from '../users.service';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
    selector: 'users-form',
    templateUrl: './usersForm.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersFormComponent implements OnInit {

    usersForm: FormGroup;
    resetPassForm: FormGroup;
    filteredOptions: Observable<any[]>;

    selectCustomerItem: any;
    isNew = false;
    companies: any[];
    filteredMenus: any[];
    selectedMenu: any | null = null;
    menus: any[];
    tagsEditMode: boolean = false;
    selectedMenuWithUser: any;



    constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        public toastr: ToastrManager,
        private _router: Router,
        private _customersService: CustomersService,
        private _usersService: UsersService,
        private readonly activatedRouter: ActivatedRoute,


    ) {
        this.menus = [
            {
                id   : 'dashboards.project',
                title: 'Project',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-check',
                link : '/dashboards/project',
            },
            {
                id      : 'app.company',
                title   : 'Company',
                type    : 'basic',
                icon    : 'heroicons_outline:user-group',
                link    : '/apps/company'
            },
             {
                id      : 'app.products',
                title   : 'Products',
                type    : 'basic',
                icon    : 'heroicons_outline:user-group',
                link    : '/apps/products'
            },
            {
                id      : 'app.vehicles',
                title   : 'Vehicles',
                type    : 'basic',
                icon    : 'heroicons_outline:truck',
                link    : '/apps/vehicles'
            },
            {
                id      : 'app.proposal',
                title   : 'Proposal',
                type    : 'basic',
                icon    : 'heroicons_outline:archive',
                link    : '/apps/proposals/list'
            },
            {
                id      : 'app.transportaion',
                title   : 'Transportation',
                type    : 'basic',
                icon    : 'heroicons_outline:flag',
                link    : '/apps/transportation/list'
            },
            {
                id      : 'app.group',
                title   : 'Movement Groups',
                type    : 'basic',
                icon    : 'heroicons_outline:collection',
                link    : '/apps/group'
            },
            {
                id      : 'app.users',
                title   : 'Users',
                type    : 'basic',
                icon    : 'heroicons_outline:user',
                link    : '/apps/users/list'
            },
            {
                id      : 'sign-out',
                title   : 'Sign Out',
                type    : 'basic',
                icon    : 'heroicons_outline:logout',
                link    : '/sign-out'
            }
        ];
        this._usersService.getMenus().subscribe(data=>{
            this.menus = data.body;
        });

        this.usersForm = this._formBuilder.group({
            id: [''],
            name: [''],
            email: [''],
            username: [''],
            password: [''],
            confirmPassword: [''],
            website: [''],
            companies: [''],
            company_id: [''],
            permissions: [''],
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
                        company_id: data.body.company_id,
                        companies: data.body.company?.name
                    });
                    this.selectedMenu = data.body.permissions.ids;
                    this.selectedMenuWithUser = data.body.permissions.ids;

                    this.filteredMenus = this.menus;
                    this.resetPassForm.patchValue({
                        id: data.body.id
                    })
                })
                this.isNew = true;
            };
        });
        this._customersService.getCustomers().subscribe(data => {
            this.companies = data.body;
 
        });
        this.filteredOptions = this.usersForm.get('companies').valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(val => {
                return this.filter(val || '')
            })
        );
    }

    ngOnInit(): void {

    }

    saveUsers() {
        if (this.usersForm.value.id) {
            this.usersForm.value.permissions = {ids:this.selectedMenuWithUser}; 
            this._usersService.updateUser(this.usersForm.value.id, this.usersForm.value).subscribe(data => {
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
                        id: '', name: '', email: '', username: '', website: '', password: '',permissions:{}
                    };
                    addUser.name = this.usersForm.value.name
                    addUser.email = this.usersForm.value.email
                    addUser.username = this.usersForm.value.username
                    addUser.website = this.usersForm.value.website
                    addUser.password = this.usersForm.value.password
                    addUser.permissions = {ids:this.selectedMenuWithUser}; 
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
    selectCompany(event: any) {
        let option = this.companies.filter(
            (product) =>
                product.name.toUpperCase() === event.option.value.toUpperCase()
        );
        this.usersForm.get('company_id').setValue(option[0].id, { emitEvent: false });


    }
    filter(val: string): Observable<any[]> {

        return this._customersService.getCustomers(0, 9999, 'name', 'asc', val)
            .pipe(
                map(response => {
                    return response.body;

                })
            )
    }
    displayFn(product) {
        return product.name;
    }
    filterMenus(event): void
    {
       

        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredMenus = this.menus.filter(tag => tag.title.toLowerCase().includes(value));
    }
    filterMenusInputKeyDown(event): void
    {
       
        // Return if the pressed key is not 'Enter'
        if ( event.key !== 'Enter' )
        {
            return;
        }

        if ( this.filteredMenus.length === 0 )
        {
            this.createMenu(event.target.value);
            event.target.value = '';

            return;
        }

        const menu = this.filteredMenus[0];
        const isTagApplied = this.selectedMenu.menus.find(id => id === menu.id);

        if ( isTagApplied )
        {
            this.removeMenuFromUser(menu);
        }
        else
        {
            this.addMenuToUser(menu);
        }
    }

    createMenu(title: string): void
    {
        const tag = {
            title
        };
        /*
        // Create tag on the server
        this..createTag(tag)
            .subscribe((response) => {

                // Add the tag to the product
                this.addTagToProduct(response);
            });
            */
    }
    removeMenuFromUser(tag: any): void
    {
        // Remove the tag
       // this.selectedProduct.tags.splice(this.selectedProduct.tags.findIndex(item => item === tag.id), 1);

        // Update the selected product form
       // this.selectedProductForm.get('tags').patchValue(this.selectedProduct.tags);

        // Mark for check
       // this._changeDetectorRef.markForCheck();
    }
    addMenuToUser(tag: any): void
    {
        // Add the tag
      //  this.selectedProduct.tags.unshift(tag.id);

        // Update the selected product form
       // this.selectedProductForm.get('tags').patchValue(this.selectedProduct.tags);

        // Mark for check
        //this._changeDetectorRef.markForCheck();
    }

    updateMenuTitle(tag: any, event): void
    {
        // Update the title on the tag
        tag.title = event.target.value;

        /*
        this._inventoryService.updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();
 
        this._changeDetectorRef.markForCheck();
        */
    }
    shouldShowCreateMenuButton(inputValue: string): boolean
    {
        return !!!(inputValue === '' || this.menus.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }
    toggleMenuEditMode(): void
    {
        this.tagsEditMode = !this.tagsEditMode;
    }
    toggleUserMenu(tag: any, change: MatCheckboxChange): void
    {
        if ( change.checked )
        {
            this.selectedMenuWithUser.push(tag.id);
            this.addMenuToUser(tag);
        }
        else
        {
            this.selectedMenuWithUser = this.selectedMenuWithUser.filter(item=>item!==tag.id);

            this.removeMenuFromUser(tag);
        }
    }
    checkMenu(id: string){
        let checkMenu = this.selectedMenu.filter(element => element === id );
        if(checkMenu.length>0){
            return true;
        }else{
            return false;
        }
    }

}
