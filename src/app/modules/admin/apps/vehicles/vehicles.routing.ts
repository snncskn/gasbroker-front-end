import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { VehiclesDetailsComponent } from './details/vehiclesDetails.component';
import { VehiclesListComponent } from './list/vehiclesList.component';

export const vehiclesRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: VehiclesListComponent,
      },
      {
        path: 'form/:id',
        component: VehiclesDetailsComponent,
      },
      {
        path: 'form',
        component: VehiclesDetailsComponent,
      }
 
];
@NgModule({
    imports: [RouterModule.forChild(vehiclesRoutes)],
    exports: [RouterModule]
  })
  export class VehiclesRoutingModule {}
