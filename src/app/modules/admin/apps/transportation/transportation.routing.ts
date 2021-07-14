import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { TransportationListComponent } from './list/tpList.component';

export const transportationRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: TransportationListComponent,
      }

 
];

@NgModule({
    imports: [RouterModule.forChild(transportationRoutes)],
    exports: [RouterModule]
  })
  export class TransportationRoutingModule {}
