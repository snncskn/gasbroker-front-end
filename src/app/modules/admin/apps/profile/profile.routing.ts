import { Route } from '@angular/router';
import { ProfileComponent } from 'app/modules/admin/apps/profile/profile.component';
import { ProfileInfoComponent } from 'app/modules/admin/apps/profile/profile-info/profile-info.component';

export const profileRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'profile'
    },
    {
        path     : 'profile',
        component: ProfileComponent,
        children : [
            {
                path     : '',
                component: ProfileInfoComponent
            }
        ]
    }
]