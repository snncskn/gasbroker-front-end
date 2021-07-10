import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { takeUntil, filter, switchMap, map } from 'rxjs/operators';
import { ProposalService } from '../proposals.service';
import { Proposal } from '../proposals.types';
import { merge, fromEvent, Observable, Subject } from 'rxjs';

@Component({
    selector: 'proposal-list',
    templateUrl: './proposalList.component.html',
})
export class ProposalListComponent implements OnInit, OnDestroy {

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    proposalsTableColumns: string[] = ['name','type','publish_date','last_offer_date','product_detail','detail'];
    isLoading: boolean = false;


    proposals$: Observable<Proposal[]>;

    proposalsCount: number = 0;
    selectedProposal: Proposal;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();




    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly ngxService: NgxUiLoaderService,
        private _proposalService: ProposalService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
    }
    ngOnInit(): void {
        this.proposals$ = this._proposalService.proposals$;
        this._proposalService.proposals$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((proposal: Proposal[]) => {

                // Update the counts
                this.proposalsCount = proposal.length;

                // Mark for check
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

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected customer when drawer closed
                this.selectedProposal = null;

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
        console.log('/apps/proposals/form')
        this._router.navigateByUrl('/apps/proposals/form');
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
  * After view init
  */
    ngAfterViewInit(): void {
        // If the user changes the sort order...
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

}
