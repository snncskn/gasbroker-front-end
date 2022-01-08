import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Proposal } from '../proposals.types';
import { ProposalService } from '../proposals.service';
import { AccordionDirective } from '../accordion.directive';

@Component({
  selector: 'app-proposal-table',
  templateUrl: './proposal-table.component.html',
  styleUrls: ['./proposal-table.component.scss']
})
export class ProposalTableComponent implements OnInit {

  @Input() proposal: string; 
  data: any[];
  fileName = "";

  isOpen: boolean = false;
  @ContentChild(AccordionDirective, { read: TemplateRef })
  accordionBodyRef: TemplateRef<unknown>;

  constructor(private readonly proposalService: ProposalService) { 
    this.data = [];
    this.proposalService.getProcessGroup().subscribe(data=>{
      console.log(data.body);
      data.body.forEach(element => {
        element.captainDate='';
        this.data.push(element);
      });
    });
  }

  ngOnInit(): void {
  }
  onFileSelected(event) {

    const file:File = event.target.files[0];

    if (file) {

        this.fileName = file.name;

        const formData = new FormData();

        formData.append("thumbnail", file);

        //const upload$ = this.http.post("/api/thumbnail-upload", formData);

        //upload$.subscribe();
    }
}

}
