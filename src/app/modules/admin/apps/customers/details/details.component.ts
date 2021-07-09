import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Customer, Country, Tag } from 'app/modules/admin/apps/customers/customers.types';
import { CustomersListComponent } from 'app/modules/admin/apps/customers/list/list.component';
import { CustomersService } from 'app/modules/admin/apps/customers/customers.service';
import { CalendarService } from '../../calendar/calendar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
    selector: 'customers-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    filteredTags: Tag[];
    customer: Customer;
    customerForm: FormGroup;
    customers: Customer[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    dataSourceTypes: any[];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _calendarService: CalendarService,
        private _snackBar: MatSnackBar,
        private _changeDetectorRef: ChangeDetectorRef,
        private _customersListComponent: CustomersListComponent,
        private _customersService: CustomersService,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private readonly ngxService: NgxUiLoaderService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        public toastr: ToastrManager

    ) {
                // Create the customer form
                this.customerForm = this._formBuilder.group({
                    id: [''],
                    types: [null],
                    full_name: ['', [Validators.required]],
                    email: [null],
                    phone: [null],
                    name: ['', [Validators.required]],
                    fax: [null],
                    registered_date: [null],
                });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._customersListComponent.matDrawer.open();

        this._customersService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });

        // Get the customers
        this._customersService.customers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customers: Customer[]) => {
                this.customers = customers;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the customer
        this._customersService.customer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customer: Customer) => {

                // Open the drawer in case it is closed
                this._customersListComponent.matDrawer.open();

                // Get the customer
                this.customer = customer;

                // Patch values to the form
                this.customerForm.patchValue(customer);

                // Toggle the edit mode off
                this.toggleEditMode(true);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._customersListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the customer
     */
    updateCustomer(): void {
        // Get the customer object
        const customer = this.customerForm.getRawValue();
        // Go through the customer object and clear empty values

        //customer.emails = customer.emails.nfilter(email => email.email);

        //customer.phoneNumbers = customer.phoneNumbers.filter(phoneNumber => phoneNumber.phoneNumber);

        // Update the customer on the server
        this.ngxService.start();
        this._customersService.updateCustomer(customer.id, customer).subscribe(() => {

            this.toastr.successToastr('Customer updated', 'Updated!');
            // Toggle the edit mode off
            this.closeDrawer();
            this.ngxService.stop();

        });
    }

    /**
     * Delete the customer
     */
    deleteCustomer(): void {
        // Get the current customer's id
        const id = this.customer.id;

        // Get the next/previous customer's id
        const currentCustomerIndex = this.customers.findIndex(item => item.id === id);
        const nextCustomerIndex = currentCustomerIndex + ((currentCustomerIndex === (this.customers.length - 1)) ? -1 : 1);
        const nextCustomerId = (this.customers.length === 1 && this.customers[0].id === id) ? null : this.customers[nextCustomerIndex].id;

        // Delete the customer
        this.ngxService.start();

        this._customersService.deleteCustomer(id)
            .subscribe((isDeleted) => {
                this.ngxService.stop();

                // Return if the customer wasn't deleted...
                if (!isDeleted) {
                    return;
                }

                // Navigate to the next customer if available
                if (nextCustomerId) {
                    this._router.navigate(['../', nextCustomerId], { relativeTo: this._activatedRoute });
                }
                // Otherwise, navigate to the parent
                else {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                }

                // Toggle the edit mode off
                this.toggleEditMode(true);
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // Upload the avatar
        this._customersService.uploadAvatar(this.customer.id, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    /*removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.customerForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the customer
        this.customer.avatar = null;
    }*/

    /**
     * Open tags panel
     */
    openTagsPanel(): void {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions()
                .withViewportMargin(64)
                .withLockedPosition()
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    }
                ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            if (this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached()) {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

    }





    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
