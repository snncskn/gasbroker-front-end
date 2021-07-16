import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from 'app/modules/admin/apps/users/list/usersList.component';
import { NgModule } from '@angular/core';
import { UsersFormComponent } from './form/usersForm.component';

export const usersRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: UsersListComponent,
      },
      {
        path: 'form/:id',
        component: UsersFormComponent,
      },
      {
        path: 'form',
        component: UsersFormComponent,
      }
 
];

@NgModule({
    imports: [RouterModule.forChild(usersRoutes)],
    exports: [RouterModule]
  })
  export class UsersRoutingModule {}
