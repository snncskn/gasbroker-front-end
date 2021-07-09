import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'vehicles',
    templateUrl    : './vehicles.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
