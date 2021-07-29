import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { takeUntil, filter, switchMap, map } from 'rxjs/operators';
import { ProposalService } from '../proposals.service';
import { Proposal } from '../proposals.types';
import { merge, fromEvent, Observable, Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OfferComponent } from '../offer/offer.component';
import { OfferListComponent } from '../offer-list/offer-list.component';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';

@Component({
    selector: 'proposal-list',
    templateUrl: './proposalList.component.html',
    styleUrls: ['./proposalList.component.scss'],
})
export class ProposalListComponent implements OnInit, OnDestroy {

    dialogRef: MatDialogRef<ConfirmationDialog>;


    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    proposalsTableColumns: string[] = ['name','type','publish_date','last_offer_date','status','product','product_detail','detail'];
    isLoading: boolean = false;


    proposals$: Observable<Proposal[]>;

    proposalsCount: number = 0;
    selectedProposal: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();

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
        private _proposalService: ProposalService,
        @Inject(DOCUMENT) private _document: any,
        public dialog: MatDialog,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {

        this._proposalService.getProposals().subscribe(data=>{
        });
    }
    ngOnInit(): void {
        this.proposals$ = this._proposalService.proposals$;
        this._proposalService.proposals$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((proposal: Proposal[]) => {

               if(proposal){
                this.selectedProposal=proposal
                this.proposalsCount = proposal.length;
               }
                this._changeDetectorRef.markForCheck();
            });

        this.isLoading=true;
        // Get the customer
        // this.customer$ = this._customersService.customer$;
        this._proposalService.proposal$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vehicle: Proposal) => {
                this.selectedProposal = vehicle;
                this.isLoading=false;

                this._changeDetectorRef.markForCheck();
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
                this.newProposal();
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
                    this._proposalService.searchProposal(query)
                )
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    newProposal(): void {
        this._router.navigateByUrl('/apps/proposals/form');
    }

    openProposal(item:any){
        this._router.navigateByUrl('/apps/proposals/form/'+item.id)
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
        
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {

            });


        // Get products if sort or page changes
        merge(this._sort.sortChange,).pipe(
            switchMap(() => {
                return this._proposalService.getProposals();
            }),
            map(() => {

            })
        ).subscribe();
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

    openProposalOffer(item:any){
        const dialogRef = this.dialog.open(OfferComponent, { data: item });
        dialogRef.afterClosed().subscribe(result => {

        });
        
    }
    openOfferList(item: any){
        const dialogRef = this.dialog.open(OfferListComponent, { data: item });
        dialogRef.afterClosed().subscribe(result => {

        }); 
    }

    deleteProposal(item:any)
    {
        this.dialogRef = this.dialog.open(ConfirmationDialog, {
            disableClose: false
          });
          this.dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this._proposalService.deleteProposal(item.id).subscribe();
            }
            this.dialogRef = null;
          });
    }

    getServerData(event?: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this._proposalService.getProposals(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.filter ).subscribe();


    }
    public applyFilter(filterValue: string) {
        this.filter = filterValue;
        this._proposalService.getProposals(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, filterValue).subscribe();

    }

} 