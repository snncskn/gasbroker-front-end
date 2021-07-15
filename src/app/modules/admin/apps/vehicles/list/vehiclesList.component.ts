import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { takeUntil, filter, switchMap, map } from 'rxjs/operators';
import { VehiclesService } from '../vehicles.service';
import { Vehicle } from '../vehicles.types';

@Component({
    selector: 'vehicles-list',
    templateUrl: './vehiclesList.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesListComponent implements OnInit, OnDestroy {

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatSort) private _sort: MatSort;


    vehicles$: Observable<Vehicle[]>;

    vehiclesCount: number = 0;
    selectedVehicle: Vehicle;
    vehiclesTableColumn: string[] = ['company_id', 'name', 'type', 'registered_date','detail'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    isLoading: boolean=false;




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
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
        this._vehicleService.getVehicles().subscribe();
    }
    ngOnInit(): void {
        // Get the customers
        this.vehicles$ = this._vehicleService.vehicles$;
        this._vehicleService.vehicles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicles: Vehicle[]) => {

                // Update the counts
                this.vehiclesCount = vehicles?.length;

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

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected customer when drawer closed
                this.selectedVehicle = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

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
    }

    ngAfterViewInit(): void {

        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {

            });


        // Get products if sort or page changes
        merge(this._sort.sortChange,).pipe(
            switchMap(() => {
                return this._vehicleService.getVehicles();
            }),
            map(() => {

            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
 
    newVehicle(): void
    {
        this._router.navigate(['/apps/vehicles/form']);
    }

    openVehicle(item:any)
    {
        this._router.navigate(['/apps/vehicles/form/'+item.id]);
    }

    deleteVehicle(item:any)
    {
        this._vehicleService.deleteVehicle(item.id).subscribe(data=>{
            this._vehicleService.getVehicles().subscribe();
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
}
