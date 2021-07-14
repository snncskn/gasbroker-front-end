import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProposalService } from '../proposals.service';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {


  offerForm: FormGroup;

  dataSourcePaymentTypes: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _proposalService: ProposalService,
    public dialogRef: MatDialogRef<OfferComponent>,
    private _formBuilder: FormBuilder) {
      this._proposalService.getPaymentTypes().subscribe(res => {
        this.dataSourcePaymentTypes = res.body;
    });

     }

  ngOnInit(): void {
    this.offerForm = this._formBuilder.group({
      proposal_id: this.data.id,
      company_id: ['2a4038f9-899c-4a51-8433-cdd8cba5edbc'],
      offer_date: [''],
      payment_type: [''],
      price: [''],
      id: [''],
      deal_status:this.data.status

    });
  }

  saveOffer(){
    this._proposalService.createProposalOffer(this.offerForm.value).subscribe(data=>{
      this.dialogRef.close()
  });
  }

  closeDialog(){
    this.dialogRef.close()
  }
}
