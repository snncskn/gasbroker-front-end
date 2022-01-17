import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as moment from 'moment';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProposalsComponent } from './proposals.component';
import { ProposalRoutingModule, proposalRoutes } from './proposals.routing';
import { ProposalListComponent } from './list/proposalList.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ProposalFormComponent } from './form/proposal-form.component';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import {MatDialogModule} from '@angular/material/dialog';
import { OfferComponent } from './offer/offer.component';
import { OfferListComponent } from './offer-list/offer-list.component';
import { TranslocoModule } from '@ngneat/transloco';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { ConfirmationModule } from '../delete-dialog/delete.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProposalProcessComponent } from './process/process.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCurrencyFormatModule } from 'mat-currency-format';
import { ProposalTableComponent } from './proposal-table/proposal-table.component';
import { AccordionDirective } from './accordion.directive';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';

import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';


const CUSTOM_PARSE_DATE_INPUT = 'l, LTS';
const CUSTOM_DISPLAY_DATE_INPUT = 'DD-MMM-YYYY, HH:mm';

// If using Moment
const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: CUSTOM_PARSE_DATE_INPUT
  },
  display: {
    dateInput: CUSTOM_DISPLAY_DATE_INPUT,
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};
@NgModule({
    declarations: [
        ProposalsComponent,
        ProposalListComponent,
        ProposalFormComponent,
        OfferComponent,
        OfferListComponent,
        ProposalProcessComponent,
        ProposalTableComponent,
        AccordionDirective
    ],
    imports     : [
        RouterModule.forChild(proposalRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatAutocompleteModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatAutocompleteModule, 
        FuseFindByKeyPipeModule,
        SharedModule,
        ProposalRoutingModule,
        MatStepperModule,
        MatDialogModule,
        MatPaginatorModule,
        MatExpansionModule,
        GoogleMapsModule,
        MatCurrencyFormatModule,
        FileUploadModule,
        ConfirmationModule,
        TranslocoModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule
        
    ],
    providers   : [
        ProposalListComponent,
        { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }


    ]
})
export class ProposalsModule
{
}
