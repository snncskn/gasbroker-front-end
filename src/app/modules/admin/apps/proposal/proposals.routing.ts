import { Route } from '@angular/router';
import { ProposalDetailsComponent } from './details/proposalDetails.component';
import { ProposalListComponent } from './list/proposalList.component';
import { ProposalsComponent } from './proposals.component';
import { CanDeactivateVehiclesDetails } from './proposals.guards';
import { ProposalDetailsResolver, ProposalResolver } from './proposals.resolvers';


export const proposalRoutes: Route[] = [
    {
        path     : '',
        component: ProposalsComponent,
        resolve  : {
        },
        children : [
            {
                path     : '',
                component: ProposalListComponent,
                resolve  : { 
                    tasks    : ProposalResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : ProposalDetailsComponent,
                        resolve      : {
                            task     : ProposalDetailsResolver,
                            
                        },
                        canDeactivate: [CanDeactivateVehiclesDetails]
                    }
                ]
            }
        ]
    }
];
