import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelpCenterService } from 'app/modules/admin/apps/help-center/help-center.service';
import { FaqCategory } from 'app/modules/admin/apps/help-center/help-center.type';
import { MatDialog } from '@angular/material/dialog';
import { DialogFaq } from '../dialog/dialog.component';

@Component({
    selector     : 'help-center-faqs',
    templateUrl  : './faqs.component.html',
    encapsulation: ViewEncapsulation.None
})
export class HelpCenterFaqsComponent implements OnInit, OnDestroy
{
    faqCategories: FaqCategory[];
    private _unsubscribeAll: Subject<any> = new Subject();

    /**
     * Constructor
     */
    constructor(private _helpCenterService: HelpCenterService,
                public dialog: MatDialog)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the FAQs
        this._helpCenterService.faqs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((faqCategories) => {
                this.faqCategories = faqCategories;
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    link(link:string){
        window.open(link, '_blank');
    }
    openDialog(row: any): void {
        console.log(row);
        const dialogRef = this.dialog.open(DialogFaq, {
          width: '450px',
          data: row,
        });
    
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        
        });
      }


}
