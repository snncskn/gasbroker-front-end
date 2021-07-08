import { Route } from '@angular/router';
import { VehiclesDetailsComponent } from './details/vehiclesDetails.component';
import { VehiclesListComponent } from './list/vehiclesList.component';
import { VehiclesComponent } from './vehicles.component';
import { CanDeactivateVehiclesDetails } from './vehicles.guards';
import { VehiclesDetailsResolver, VehiclesResolver } from './vehicles.resolvers';


export const vehiclesRoutes: Route[] = [
    {
        path     : '',
        component: VehiclesComponent,
        resolve  : {
        },
        children : [
            {
                path     : '',
                component: VehiclesListComponent,
                resolve  : { 
                    tasks    : VehiclesResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : VehiclesDetailsComponent,
                        resolve      : {
                            task     : VehiclesDetailsResolver,
                            
                        },
                        canDeactivate: [CanDeactivateVehiclesDetails]
                    }
                ]
            }
        ]
    }
];
