import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'transportation',
    templateUrl    : './transportation.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransportationComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
