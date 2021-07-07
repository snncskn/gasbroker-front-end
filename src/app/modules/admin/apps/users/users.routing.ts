import { Route } from '@angular/router';
import { UsersComponent } from 'app/modules/admin/apps/users/users.component';
import { UsersListComponent } from 'app/modules/admin/apps/users/list/usersList.component';
import { UsersResetComponent } from 'app/modules/admin/apps/users/resetpass/usersReset.component';
import { UserListResolver } from 'app/modules/admin/apps/users/users.resolvers';
import { UsersRolesComponent } from './roles/usersRoles.component';

export const usersRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'users'
    },
    {
        path     : 'users',
        component: UsersComponent,
        children : [
            {
                path     : '',
                component: UsersListComponent,
                /*resolve  : {
                    users  : UserListResolver
                }*/
            }
        ]
    },

    {
        path     : 'usersreset',
        component: UsersComponent,
        children : [
            {
                path     : '',
                component: UsersResetComponent,
            }
        ]
    },

    {
        path     : 'usersroles',
        component: UsersComponent,
        children : [
            {
                path     : '',
                component: UsersRolesComponent,
            }
        ]
    }
];