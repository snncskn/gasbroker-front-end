import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductService } from '../../ecommerce/product/product.service';
import { InventoryProduct } from '../../ecommerce/product/product.types';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { ProposalService } from '../proposals.service';


@Component({
    selector: 'proposal-form',
    templateUrl: './proposal-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalFormComponent implements OnInit, OnDestroy {
 
    verticalStepperForm: FormGroup;
    products: InventoryProduct[];
    selectedProdcut: any;
    filteredOptions: Observable<any[]>;
    dataSourceTypes: any[];
    dataSourceStatus: any[];
    dataSourceDocs: any[];
    locationLabel: string;

    constructor(private _formBuilder: FormBuilder,
        private _vehiclesService: VehiclesService,
        private _productService: ProductService,
        private _proposalService: ProposalService,
    ) {
    }


    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }

    ngOnInit(): void {
        this.verticalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                type: ['', Validators.required],
                publish_date: ['', Validators.required],
                last_offer_date: ['', Validators.required]
            }),
            step2: this._formBuilder.group({
                products: ['', Validators.required],
                quantity: ['', Validators.required],
                location: ['', Validators.required],

            }),
            step3: this._formBuilder.group({
                byEmail: this._formBuilder.group({
                    companyNews: [true],
                    featuredProducts: [false],
                    messages: [true]
                }),
                pushNotifications: ['everything', Validators.required]
            })
        });

        this._productService.getFilterProducts().subscribe(data => {
            this.products = data;
        });

        this.filteredOptions = this.verticalStepperForm.get('step2').get('products').valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(val => {
                return this.filter(val || '')
            })
        );
        this._proposalService.getProposalTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });
        this._proposalService.getProposalStatus().subscribe(res => {
            this.dataSourceStatus = res.body;
        });
        this._proposalService.getProposalDocs().subscribe(res => {
            this.dataSourceDocs = res.body;
        });

        this.locationLabel = 'Ürünün bulunduğu yer';




    }

    filter(val: string): Observable<any[]> {

        return this._productService.getFilterProducts(val)
            .pipe(
                map(response => {
                    return response.body;

                })
            )
    }

    selectProduct(event: any) {
        let option = this.products.filter(item => item.name.toUpperCase() === event.option.value.toUpperCase());
        if (option.length > 0) {
            this.selectedProdcut = option[0];

            //this.eventForm.get('customersId').setValue(option[0].id, { emitEvent: false });
        }


    }
    save() {
       this._proposalService.createProposal(this.verticalStepperForm.value).subscribe(data=>{
           console.log(data.body);
       });
    }

    onChangeType(event) {
        console.log(event.value);
        if (event.value === 'Alış') {
            this.locationLabel = 'Ürünün bulunduğu yer';
        } else {
            this.locationLabel = 'Ürünün varış yeri';
        }

    }


}
