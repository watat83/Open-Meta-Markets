import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftCollectionComponent } from './nft-collection.component';

describe('NftCollectionComponent', () => {
  let component: NftCollectionComponent;
  let fixture: ComponentFixture<NftCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftCollectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NftCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
