import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProposalService } from '../proposals.service';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {


  offerForm: FormGroup;

  dataSourcePaymentTypes: any[];

  constructor(
    private _proposalService: ProposalService,
    private _formBuilder: FormBuilder) {
      this._proposalService.getPaymentTypes().subscribe(res => {
        this.dataSourcePaymentTypes = res.body;
    });

     }

  ngOnInit(): void {
    this.offerForm = this._formBuilder.group({
      proposal_id: [''],
      company_id: [''],
      offer_date: [''],
      payment_type: [''],
      price: [''],
      id: ['']

    });
  }

}
