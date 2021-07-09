import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'customersTD',
    templateUrl    : './customersTD.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersTDComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
