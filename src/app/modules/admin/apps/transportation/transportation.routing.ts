import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { TransportationListComponent } from './list/tpList.component';
import { TransportationFormComponent } from './form/tpForm.component';
import { ProcessesResolver } from './transportation.resolvers';

export const transportationRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: TransportationListComponent,
        resolve  : {
          processes: ProcessesResolver
        }
      },
      {
        path: 'form',
        component: TransportationFormComponent,
      },
      {
        path: 'form/:id',
        component:TransportationFormComponent,
      }

 
];

@NgModule({
    imports: [RouterModule.forChild(transportationRoutes)],
    exports: [RouterModule]
  })
  export class TransportationRoutingModule {}
