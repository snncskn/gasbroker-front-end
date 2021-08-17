import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { takeUntil, filter, switchMap, map } from 'rxjs/operators';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { InventoryPagination } from '../../product/product.types';
import { VehiclesService } from '../vehicles.service';
import { Vehicle } from '../vehicles.types';

@Component({
    selector: 'vehicles-list',
    templateUrl: './vehiclesList.component.html',
    styleUrls: ['./vehiclesList.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesListComponent implements OnInit, OnDestroy {

    dialogRef: MatDialogRef<ConfirmationDialog>;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;


    vehicles$: Observable<Vehicle[]>;

    vehiclesCount: number = 0;
    selectedVehicle: Vehicle;
    vehiclesTableColumn: string[] = ['company_id', 'name', 'type', 'registered_date', 'detail'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    isLoading: boolean = false;
    pagination: InventoryPagination;

    totalSize$: Observable<any>;
    totalPage$: Observable<any>;
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
        private _vehicleService: VehiclesService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private dialog: MatDialog

    ) {
        this._vehicleService.getVehicles().subscribe();
    }
    ngOnInit(): void {
        this.ngxService.start();
        this._vehicleService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InventoryPagination) => {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.vehicles$ = this._vehicleService.vehicles$;
        this.totalSize$ = this._vehicleService.getTotalSize$;
        this.totalPage$ = this._vehicleService.getTotalPage$;
        this._vehicleService.vehicles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicles: Vehicle[]) => {
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._vehicleService.vehicle$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicle: Vehicle) => {
                // Update the counts
                this.selectedVehicle = vehicle;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        /*  this.matDrawer.openedChange.subscribe((opened) => {
              if (!opened) {
                  // Remove the selected customer when drawer closed
                  this.selectedVehicle = null;
  
                  // Mark for check
                  this._changeDetectorRef.markForCheck();
              }
          });*/

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.newVehicle();
            });

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

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>

                    // Search
                    this._vehicleService.searchVehicles(query)
                )
            )
            .subscribe();
        this.ngxService.stop();
    }

    ngAfterViewInit(): void {

        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {

            });


        // Get products if sort or page changes
        merge(this._sort.sortChange,).pipe(
            switchMap(() => {
                this.isLoading = true;
                return this._vehicleService.getVehicles();
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    newVehicle(): void {
        this._router.navigate(['/apps/vehicles/form']);
    }

    openVehicle(item: any) {
        this._router.navigate(['/apps/vehicles/form/' + item.id]);
    }

    deleteVehicle(item: any) {
        this.dialogRef = this.dialog.open(ConfirmationDialog, {
            disableClose: false
        });
        this.dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.ngxService.start();
                this._vehicleService.deleteVehicle(item.id).subscribe(data => {
                    this._vehicleService.getVehicles().subscribe();
                });
            this.ngxService.stop();
            }
            this.dialogRef = null;
        });

    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
        this._vehicleService.getVehicles(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter).subscribe();


    }
    public applyFilter(filterValue: string) {
        this.filter = filterValue;
        this._vehicleService.getVehicles(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, filterValue).subscribe();

    }

}
