import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { ProcessService } from '../transportation.service';
import { Process } from '../transportation.types';

@Component({
    selector       : 'tp-list',
    templateUrl    : './tpList.component.html',
    styleUrls: ['./tpList.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransportationListComponent implements OnInit
{

    dialogRef: MatDialogRef<ConfirmationDialog>;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    processCount: number = 0;
    processes$:Observable<Process[]>
    transportations$: Observable<any[]>
    transportationsCount: number = 0;
    drawerMode: 'side' | 'over';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    transportationTableColumns: string[] = ['process_date', 'address', 'group', 'group_sub','detail'];
    selectedProcess:any;

    totalSize$: Observable<any>;
    totalPage$: Observable<any>;
    public currentPage = 1;
    public pageSize = 10;
    public filter: string;

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _processService: ProcessService,
        private dialog: MatDialog


    )
    {
        this._processService.getProcess().subscribe();
    }

    ngOnInit(): void{

        this.processes$ = this._processService.processes$;
        this._processService.processes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((process: Process[]) => {

               if(process){
                this.selectedProcess=process
                this.processCount = process.length;
               }
                this._changeDetectorRef.markForCheck();
            });
    }

    newProcess(){
        this._router.navigate(['/apps/transportation/form']);
    }

    openProcess(item:any)
    {
        this._router.navigate(['/apps/transportation/form/'+item.id]);
    }

    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

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
        this._processService.getProcess(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter ).subscribe();


    }
    public applyFilter(filterValue: string) {
        this.filter = filterValue;
        this._processService.getProcess(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, filterValue).subscribe();

    }
}