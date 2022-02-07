import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { HelpCenterComponent } from 'app/modules/admin/apps/help-center/help-center.component';
import { HelpCenterFaqsComponent } from 'app/modules/admin/apps/help-center/faqs/faqs.component';
import { HelpCenterGuidesComponent } from 'app/modules/admin/apps/help-center/guides/guides.component';
import { HelpCenterGuidesCategoryComponent } from 'app/modules/admin/apps/help-center/guides/category/category.component';
import { HelpCenterGuidesGuideComponent } from 'app/modules/admin/apps/help-center/guides/guide/guide.component';
import { HelpCenterSupportComponent } from 'app/modules/admin/apps/help-center/support/support.component';
import { helpCenterRoutes } from 'app/modules/admin/apps/help-center/help-center.routing';
import { DialogFaq } from './dialog/dialog.component';
import { HeaderFaq } from './dialog/header/dialog-header.component';
import { upHeaderFaq } from './dialog/upHeader/dialog-upHeader.component';


@NgModule({
    declarations: [
        HelpCenterComponent,
        HelpCenterFaqsComponent,
        HelpCenterGuidesComponent,
        HelpCenterGuidesCategoryComponent,
        HelpCenterGuidesGuideComponent,
        HelpCenterSupportComponent,
        DialogFaq,
        HeaderFaq,
        upHeaderFaq
    ],
    imports     : [
        RouterModule.forChild(helpCenterRoutes),
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FuseAlertModule,
        SharedModule,
        MatTooltipModule
    ]
})
export class HelpCenterModule
{
}
