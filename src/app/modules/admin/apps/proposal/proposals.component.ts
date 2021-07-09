import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'proposals',
    templateUrl    : './proposals.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
