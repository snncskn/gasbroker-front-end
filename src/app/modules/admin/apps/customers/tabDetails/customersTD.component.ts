import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
     example:string;
     constructor(private router: Router) { 
             const navigation = this.router.getCurrentNavigation();
       
       this.example = 'testsetfsdfkdjsaflkdjs';
     }
}
