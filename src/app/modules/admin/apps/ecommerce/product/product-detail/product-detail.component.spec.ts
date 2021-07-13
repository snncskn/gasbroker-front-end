import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProductDetailComponent } from "./product-detail.component";
import { MailboxComposeComponent } from "../compose/compose.component";

describe("ProductDetailComponent", () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductDetailComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

describe("MailboxComposeComponent", () => {
  let component: MailboxComposeComponent;
  let fixture: ComponentFixture<MailboxComposeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailboxComposeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxComposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
