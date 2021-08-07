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
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as moment from 'moment';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { CompanyRoutingModule, customersRoutes } from 'app/modules/admin/apps/company/company.routing';
import { CustomersComponent } from 'app/modules/admin/apps/company/company.component';
import { CustomersListComponent } from 'app/modules/admin/apps/company/list/list.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomersTDComponent } from './tabDetails/companyTD.component';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoogleMapsModule } from '@angular/google-maps';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { TranslocoModule } from '@ngneat/transloco';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConfirmationModule } from '../delete-dialog/delete.module';
import { ApprovalComponent } from './approvalDialog/approval.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    declarations: [
        CustomersComponent,
        CustomersListComponent,
        CustomersTDComponent,
        ApprovalComponent,

    ],
    imports     : [
        RouterModule.forChild(customersRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatDialogModule,
        MatSortModule,
        MatExpansionModule,
        FuseFindByKeyPipeModule,
        MatTabsModule,
        FormsModule,
        CompanyRoutingModule,
        GoogleMapsModule,
        SharedModule,
        FileUploadModule,
        TranslocoModule,
        ConfirmationModule    
    ],
    providers   : [
        {
            provide : MAT_DATE_FORMATS,
            
            useValue: {
                parse  : {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput         : 'DD/MM/yyyy',
                    monthYearLabel    : 'MMM YYYY',
                    dateA11yLabel     : 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                },
                availableLangs: ['en', 'tr'],
                defaultLang: 'en'
            }
        }
    ],
})
export class CompanyModule
{
}
