import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { GroupListComponent } from './list/groupList.component';
import { GroupFormComponent } from './form/groupForm.component';
import { GroupsResolver } from './group.resolvers';

export const groupRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: GroupListComponent,
        resolve  : {
          groups: GroupsResolver
        }
      },
      {
        path: 'form',
        component: GroupFormComponent,
      },
      {
        path: 'form/:id',
        component: GroupFormComponent,
      }

 
];

@NgModule({
    imports: [RouterModule.forChild(groupRoutes)],
    exports: [RouterModule]
  })
  export class GroupRoutingModule {}
