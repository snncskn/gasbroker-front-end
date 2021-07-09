import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, filter, map } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ProposalListComponent } from '../list/proposalList.component';
import { Proposal } from '../proposals.types';
import { ProposalService } from '../proposals.service';

@Component({
    selector: 'proposal-details',
    templateUrl: './proposalDetails.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalDetailsComponent implements OnInit, OnDestroy {

    vehicle: Proposal;
    vehicleForm: FormGroup;
    customers: any[];
    vehicles: Proposal[];
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
        private _vehiclesListComponent: ProposalListComponent,
        private _vehiclesService: ProposalService,
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
            company: [''],
            company_id: [''],
            registered_date: [null],
        });

        this._vehiclesService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });

        this._vehiclesService.proposals$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicles: Proposal[]) => {
                this.vehicles = vehicles;
                this._changeDetectorRef.markForCheck();
        });
        this._vehiclesService.proposal$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicle: Proposal) => {

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
          this.filteredOptions = this.vehicleForm.controls['company'].valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value === '' ? '99' : value))
          );
        });
    }

    selectCustomer(event: any) {
        let option = this.customers.filter(item => item.full_name.toUpperCase() === event.option.value.toUpperCase());
        if (option.length > 0) {
          this.selectCustomerItem = option[0];
          this.vehicleForm.get('company_id').setValue(option[0].id, { emitEvent: false });
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
        if(vehicle.id==='new'){
            vehicle.id ='';
            this._vehiclesService.createVehicle(vehicle).subscribe(() => {
                this.toastr.successToastr('Vehicle updated', 'Updated!');
                this.closeDrawer();
                this.ngxService.stop();
            });
        }else{
            this._vehiclesService.updateVehicle(vehicle.id, vehicle).subscribe(() => {
                this.toastr.successToastr('Vehicle updated', 'Updated!');
                this.closeDrawer();
                this.ngxService.stop();
    
            });
        }
        this._changeDetectorRef.markForCheck();
    
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
