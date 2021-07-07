import { NgModule } from '@angular/core';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { ProductPipe } from './product-pipe';

@NgModule({
    declarations: [
        FuseFindByKeyPipe,
        ProductPipe
    ],
    exports     : [
        FuseFindByKeyPipe,
        ProductPipe
    ]
})
export class FuseFindByKeyPipeModule
{
}
