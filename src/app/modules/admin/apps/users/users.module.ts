import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { UsersComponent } from 'app/modules/admin/apps/users/users.component';
import { UsersListComponent} from 'app/modules/admin/apps/users/list/usersList.component';
import { UsersResetComponent } from 'app/modules/admin/apps/users/resetpass/usersReset.component';
import { usersRoutes } from 'app/modules/admin/apps/users/users.routing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersRolesComponent } from './roles/usersRoles.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [
        UsersComponent,
        UsersListComponent,
        UsersResetComponent,
        UsersRolesComponent
    ],
    imports     : [
        RouterModule.forChild(usersRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTabsModule,
        SharedModule
    ]
})
export class UsersModule
{
}