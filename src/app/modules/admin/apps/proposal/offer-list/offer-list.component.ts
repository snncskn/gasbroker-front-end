import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProposalService } from '../proposals.service';
import { ProposalOffer } from '../proposals.types';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit {

  offers$:Observable<ProposalOffer[]>;
  offersTableColumns: string[] = ['company_name','payment_type','price','offer_date','deal_status','deal_status_btn'];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  offersCount: number=0;



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _proposalService: ProposalService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { 
    this._proposalService.getOffers(this.data.id).subscribe(data=>{
    });
  }

  ngOnInit(): void {

    this.offers$ = this._proposalService.offers$;
    this._proposalService.proposals$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((offer: ProposalOffer[]) => {

           if(offer){
            this.offersCount = offer.length;
           }
            this._changeDetectorRef.markForCheck();
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
sendStatus(item: any,status : string){

  item.deal_status= status;
  this._proposalService.updateProposalOffer(item).subscribe(data=>{

  });
}

}
