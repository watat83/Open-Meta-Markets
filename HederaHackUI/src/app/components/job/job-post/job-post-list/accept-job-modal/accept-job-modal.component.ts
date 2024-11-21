import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { INFT } from '../../../../signup/signup.component';

@Component({
  selector: 'app-accept-job-modal',
  templateUrl: './accept-job-modal.component.html',
  styleUrls: ['./accept-job-modal.component.scss']
})
export class AcceptJobModalComponent implements OnInit {
  selectedNftProfile: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AcceptJobModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, nftProfiles: INFT[] }
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.selectedNftProfile) {
      this.dialogRef.close({ selectedNftProfile: this.selectedNftProfile });
    } else {
      alert('Please select a profile.');
    }
  }

  async ngOnInit() {
  }

}
