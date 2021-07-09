import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, filter, map } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrManager } from 'ng6-toastr-notifications';
import { VehiclesListComponent } from '../list/vehiclesList.component';
import { Vehicle } from '../vehicles.types';
import { VehiclesService } from '../vehicles.service';

@Component({
    selector: 'vehicles-details',
    templateUrl: './vehiclesDetails.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesDetailsComponent implements OnInit, OnDestroy {

    vehicle: Vehicle;
    vehicleForm: FormGroup;
    customers: any[];
    vehicles: Vehicle[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    dataSourceTypes: any[];
    filteredOptions: Observable<string[]>;
    selectCustomerItem: any;




    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _vehiclesListComponent: VehiclesListComponent,
        private _vehiclesService: VehiclesService,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private readonly ngxService: NgxUiLoaderService,
        public toastr: ToastrManager

    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._vehiclesListComponent.matDrawer.open();

        // Create the Vehicle form
        this.vehicleForm = this._formBuilder.group({
            id: [''],
            type: [''],
            name: ['', [Validators.required]],
            company_id: [''],
            customers: [''],
            registered_date: [null],
        });

        this._vehiclesService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });

        // Get the vehicles
        this._vehiclesService.vehicles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicles: Vehicle[]) => {
                this.vehicles = vehicles;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the vehicle
        this._vehiclesService.vehicle$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicle: Vehicle) => {

                // Open the drawer in case it is closed
                this._vehiclesListComponent.matDrawer.open();

                // Get the Vehicle
                this.vehicle = vehicle;

                // Patch values to the form
                this.vehicleForm.patchValue(vehicle);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

           /* this.filteredOptions = this.vehicleForm.get('full_name').valueChanges.pipe(
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(val => {
                  return this.filter(val || '')
                })
              );*/
              this.list();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    private _filter(value: string): string[] {

        let filterValue;
        if (value === '99') {
          filterValue = '';
        } else {
          filterValue = value;
        }
    
        return this.customers.filter(option => {
          return option.full_name?.indexOf(filterValue) === 0 || option.full_name?.indexOf(filterValue.toLowerCase()) === 0;
        });
    }

    public list() {
        this._vehiclesService.getCustomers().subscribe(data => {
          this.customers = data.body;
          this.filteredOptions = this.vehicleForm.controls['customers'].valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value === '' ? '99' : value))
          );
        });
    }

    selectCustomer(event: any) {
        let option = this.customers.filter(item => item.full_name.toUpperCase() === event.option.value.toUpperCase());
        if (option.length > 0) {
          this.selectCustomerItem = option[0];
          this.vehicleForm.get('customers').setValue(option[0].id, { emitEvent: false });
        }
    }
    
    
    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._vehiclesListComponent.matDrawer.close();
    }

    vehicleDetails()
    {

    }

    /**
     * Update the customer
     */
    updateVehicle(): void {
        // Get the customer object
        const vehicle = this.vehicleForm.getRawValue();

        // Update the customer on the server
        this.ngxService.start();
        this._vehiclesService.updateVehicle(vehicle.id, vehicle).subscribe(() => {

            this.toastr.successToastr('Vehicle updated', 'Updated!');
            // Toggle the edit mode off
            this.closeDrawer();
            this.ngxService.stop();

        });
    }

    
    
    /**
     * Delete the customer
     
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
    }*/
}
