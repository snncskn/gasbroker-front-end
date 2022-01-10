import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Proposal } from '../proposals.types';
import { ProposalService } from '../proposals.service';
import { AccordionDirective } from '../accordion.directive';
import { FileService } from '../../../../../services/file.service';

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
  isLoading = false;
  @ContentChild(AccordionDirective, { read: TemplateRef })
  accordionBodyRef: TemplateRef<unknown>;

  constructor(private readonly proposalService: ProposalService,
              private readonly fileService: FileService) {
    this.data = [];
    this.isLoading = false;
    this.proposalService.getProcessGroup().subscribe(data => {
      
      data.body.forEach(element => {
        delete element.id;
        element.captainDate = '';
        element.process_sub_groups.forEach(subItem => {
          subItem.captain_process_date = '';
          subItem.agency_process_date = '';
          subItem.lm_process_date = '';
          
        });
        this.data.push(element);
 
      });
      this.isLoading = true;
      console.log(this.data);
    });
  }

  ngOnInit(): void {
    this.proposalService.getProcessDetail(this.proposal).subscribe(data=>{
      console.log(data);
    })

  }
  onFileSelected(event,param: string,row: any) {
    console.log(event);
    const file: File = event.target.files[0];
    this.fileService.putUrl({type: file.type, key: param}).then((res) => {
      const {
        data: { putURL },
      } = res;
      this.fileService.upLoad(putURL, file).then(
        (res) => {
          console.log(res);
          row[param] = res.config.url;
          this.proposalService.updateRow(row).subscribe(data => {
            console.log(data);
          });
        });
    });
  }
  loadGroup(item: any){

    this.proposalService.getProcessDetail(this.proposal).subscribe(data=>{
      console.log(data.body);
      item.process_sub_groups.forEach(subElement => {
        let tmp = data.body.find(item=> item.group_sub_id === subElement.id);
        if(tmp){
          if(tmp.captain_process_date){
            subElement.captain_process_date = new Date(tmp.captain_process_date);
          }
          if(tmp.lm_process_date){
            subElement.lm_process_date = new Date(tmp.lm_process_date);
          }
          if(tmp.agency_process_date){
            subElement.agency_process_date = new Date(tmp.agency_process_date);
          }
          if(tmp.captain_media_path){
            subElement.captain_media_path = tmp.captain_media_path;
          }
          if(tmp.agency_media_path){
            subElement.agency_media_path = tmp.agency_media_path;
          }
          if(tmp.lm_media_path){
            subElement.lm_media_path = tmp.lm_media_path;
          }
          subElement.id = tmp.id;
        }
        console.log(tmp);
      });
  
    })
  }

  editRowCaptain(event,row: any){
    row.captain_process_date_str = ''+event.toISOString();
    let item = {
      id:'',
      group_sub_id:row.id,
      group_id: row.group_id,
      process_id: this.proposal,
      captain_process_date: event.toISOString(),
      agency_process_date: row.agency_process_date_str,
      lm_process_date: row.lm_process_date_str,

    };
    if(row.realId){
      item.id = row.realId;
    }else{
      delete item.id;
    }
    this.proposalService.updateRow(item).subscribe(data=>{
      row.realId = data.body.id;
      console.log(data);
    })
  }
  editRowAg(event,row: any){
    row.agency_process_date_str = ''+event.toISOString();

    let item = {
      id:'',
      group_sub_id:row.id,
      group_id: row.group_id,
      process_id: this.proposal,
      agency_process_date: event.toISOString(),
      lm_process_date: row.lm_process_date_str ?  row.lm_process_date_str.toISOString() : '',
      captain_process_date: row.captain_process_date ?  row.captain_process_date.toISOString() : '',
    };
    if(row.realId){
      item.id = row.realId;
    }else{
      delete item.id;
    }
    this.proposalService.updateRow(item).subscribe(data=>{
      row.realId = data.body.id;
      console.log(data);
    });
  }
  editRowLm(event,row: any){
    row.lm_process_date_str = ''+event.toISOString();

    let item = {
      id:'',
      group_sub_id:row.id,
      group_id: row.group_id,
      process_id: this.proposal,
      agency_process_date: row.agency_process_date_str  ?  row.agency_process_date_str.toISOString() : '',
      captain_process_date: row.captain_process_date_str ?  row.captain_process_date_str.toISOString() : '',
      lm_process_date: event.toISOString(),
    };
    if(row.realId){
      item.id = row.realId;
    }else{
      delete item.id;
    }
    this.proposalService.updateRow(item).subscribe(data=>{
      row.realId = data.id;
      console.log(data);
    })
  }

  openNewWindows(link: string){
    window.open(link, '_blank');
  }

}
