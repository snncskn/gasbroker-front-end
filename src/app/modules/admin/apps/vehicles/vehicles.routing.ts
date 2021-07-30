import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { VehiclesDetailsComponent } from './details/vehiclesDetails.component';
import { VehiclesListComponent } from './list/vehiclesList.component';
import { VehiclesResolver } from './vehicles.resolvers';

export const vehiclesRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: VehiclesListComponent,
        resolve: {
          vehicles:VehiclesResolver,
        }
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
