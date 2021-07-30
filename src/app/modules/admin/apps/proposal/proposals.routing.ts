import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { ProposalFormComponent } from './form/proposal-form.component';
import { ProposalListComponent } from './list/proposalList.component';
import { ProposalResolver } from './proposals.resolvers';



export const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: ProposalListComponent,
        resolve  : {
          proposals:ProposalResolver
        }
      },
      {
        path: 'form/:id',
        component: ProposalFormComponent,
      },
      {
        path: 'form',
        component: ProposalFormComponent,
      }
 
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ProposalRoutingModule {}