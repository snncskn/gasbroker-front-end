import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Company, Country } from 'app/modules/admin/apps/company/company.types';
import { CustomersService } from 'app/modules/admin/apps/company/company.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSort } from '@angular/material/sort';

@Component({
    selector       : 'customers-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild(MatSort) private _sort: MatSort;

    customers$: Observable<Company[]>;
    //customer$: Observable<Customer>;

    customersCount: number = 0;
    customersTableColumns: string[] = ['name', 'type', 'registered_date', 'email','phone','detail'];
    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedCustomer: Company;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;


    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly ngxService: NgxUiLoaderService,
        private _customersService: CustomersService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    )
    {
        this._customersService.getCustomers().subscribe(data=>{

        });
    }
 
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the customers
        this.customers$ = this._customersService.customers$;
        this._customersService.customers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customers: Company[]) => {

                // Update the counts
                this.customersCount = customers?.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }); 
            
        this._customersService.customer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customer: Company) => {
                // Update the counts
                this.selectedCustomer = customer;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }); 

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>

                    // Search
                    this._customersService.searchCustomers(query)
                )
            )
            .subscribe();

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

          
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {

        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {

            });


        // Get products if sort or page changes
        merge(this._sort.sortChange,).pipe(
            switchMap(() => {
                return this._customersService.getCustomers();
            }),
            map(() => {

            })
        ).subscribe();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create customer
     */
     newCompany(): void
    {
        this._router.navigate(['/apps/company/form']);

    }

    openCompany(item:any)
    {
        this._router.navigate(['/apps/company/form/'+item.id]);
    }

    deleteCompany(item:any)
    {
        this._customersService.deleteCustomer(item.id).subscribe();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
