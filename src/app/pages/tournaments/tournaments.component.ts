import { Component } from '@angular/core';
import { MOCK_DATA } from '../../shared/mock-data';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import _ from 'lodash';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { RouterModule } from '@angular/router';
declare const bootstrap: any;

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectComponent,RouterModule
  ],
  templateUrl: './tournaments.component.html',
  styleUrl: './tournaments.component.scss'
})
export class TournamentsComponent {

  tournaments: any = [];
  teams: any = [];
  tournamentForm: any;
  isEditMode: boolean = false;
  editData: any = {};
  submitted: boolean = false;
  tournamentModal: any;
  searchText: string = '';


  constructor(private fb: FormBuilder,private mockService: MockDataService) {
    this.teams = this.mockService.getTeams();
    this.tournaments = this.mockService.getTournaments();
    console.log(this.tournaments);
  }

  ngOnInit(): void {
    this.loadForm();
  }

  searchTeam(): void {
    this.tournaments = this.mockService.getTournaments().filter((team: any) => {
      return team.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
             team.hostName.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }


  loadForm(): void {
    this.submitted = false;
    this.tournamentForm = this.fb.group({
      name: [this.editData?.name || '',Validators.required],
      startDate: [this.editData?.startDate || null,Validators.required],
      endDate: [this.editData?.endDate || null,Validators.required],
      format: [this.editData?.format || '',Validators.required],
      overs: [this.editData?.overs || '', ... this.editData.format == 'Çustom' ? [Validators.required] : []],
      hostId: [this.editData?.hostId || '',Validators.required],
      participants: [_.map(this.editData?.participants,'team_id') || null, Validators.required ],
      hostName: [this.editData?.hostName || '']
    });
    this.tournamentForm.get('format').valueChanges.subscribe((format: any)=>{
      this.tournamentForm.get("overs")?.setValue("");
      if(format=='Çustom') {
        this.tournamentForm.get("overs")?.setValidators([])
      } else {
        this.tournamentForm.get("overs")?.setValidators([Validators.required]);
      }
      this.tournamentForm.get("overs")?.updateValueAndValidity()
    });
  }

  get f() { return this.tournamentForm.controls; }

  openTournamentModal(tournament?: any): void {
    this.editData = tournament || {};
    if (tournament) {
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
    }
    this.loadForm();
    this.tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal')!);
    this.tournamentModal.show();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.tournamentForm.invalid) {
      return;
    }
    let payload = this.tournamentForm.value;
    payload['hostName'] = _.find(this.teams,{ 'team_id': Number.parseInt(payload.hostId) })?.team_name;
    payload['participants'] = _.map(payload.participants,(team_id)=>_.find(this.teams,{ team_id }));
    if(this.isEditMode) {
      const index = this.tournaments.findIndex((tournament: any) => tournament.id === this.editData.id);
      this.tournaments[index] = payload;
    }
    else {
      this.tournaments.push(payload);
    }
    this.mockService.updateTournament(this.tournaments);
    document.getElementById("btn-close")?.click();
  }

  deleteTournament(tournament: any): void {
    this.tournaments = this.tournaments.filter((item: any) => item.id !== tournament.id);
    this.mockService.updateTournament(this.tournaments);
  }
  onFormatChange(event: any) {
    const selectedFormat = event.target.value;
    console.log("Selected format:", selectedFormat);
    if (event.target.value == 'T20') {
      this.tournamentForm.get('overs').setValue(20);
    }else if (event.target.value == 'ODI') {
      this.tournamentForm.get('overs').setValue(50);
    }else if (event.target.value == 'Test') {
      this.tournamentForm.get('overs').setValue(10);
    }
  }
}
