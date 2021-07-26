import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Company } from 'app/modules/admin/apps/company/company.types';
import { CustomersService } from 'app/modules/admin/apps/company/company.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSort } from '@angular/material/sort';
import { InventoryPagination } from '../../ecommerce/product/product.types';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'customers-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    customers$: Observable<Company[]>;
    //customer$: Observable<Customer>;

    totalSize$: Observable<any>;
    totalPage$: Observable<any>;

    customersTableColumns: string[] = ['name', 'type', 'registered_date', 'email', 'phone', 'detail'];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedCustomer: Company;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;
    pagination: InventoryPagination;
    public currentPage = 1;
    public pageSize = 10;
    public filter: string;
    
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
    ) {

        //   this._customersService.getCustomers().subscribe();

    }



    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this._customersService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InventoryPagination) => {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.customers$ = this._customersService.customers$;
        this.totalSize$ = this._customersService.getTotalSize$;
        this.totalPage$ = this._customersService.getTotalPage$;
        this._customersService.customers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customers: Company[]) => {
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
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

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
    }

    ngAfterViewInit(): void {
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._paginator.pageIndex = 0;
            });


        // Get products if sort or page changes
        merge(this._sort.sortChange,).pipe(
            switchMap(() => {
                this.isLoading = true;
                return this._customersService.getCustomers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter );
            }),
            map(() => {
                this.isLoading = false;

            })
        ).subscribe();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create customer
     */
    newCompany(): void {
        this._router.navigate(['/apps/company/form']);

    }

    openCompany(item: any) {
        this._router.navigate(['/apps/company/form/' + item.id]);
    }

    deleteCompany(item: any) {
        this._customersService.deleteCompany(item.id).subscribe(data => {
            this._customersService.getCustomers().subscribe();
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
        this._customersService.getCustomers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter ).subscribe();


    }
    public applyFilter(filterValue: string) {
        this.filter = filterValue;
        this._customersService.getCustomers(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, filterValue).subscribe();

    }

}
