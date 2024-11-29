import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
declare const bootstrap: any;
@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
})
export class TeamsComponent implements OnInit {
  searchText: string = '';
  teams: Array<any> = [];
  newTeams: Array<any> = [];
  isEditMode: boolean = false;
  teamForm: any;
  submitted: boolean = false;
  editData: any = {};
  tournamentModal: any;
  constructor(private mockService: MockDataService, private fb: FormBuilder) {
    this.teams = this.mockService.getTeams();
    this.newTeams = this.mockService.getNewTeams();
    console.log(this.newTeams);

  }
  ngOnInit(): void {
    this.loadForm();
  }
  get f() {
    return this.teamForm.controls;
  }

  loadForm(): void {
    this.submitted = false;
    this.teamForm = this.fb.group({
      team_name: [this.editData?.name, Validators.required],
      Matches: [0, Validators.required],
      Points: [0, Validators.required],
      Rating: [0, Validators.required],
    });
  }
  onSubmit() {
    this.submitted = true;
    if (this.teamForm.invalid) {
      return;
    }
    // let isTeamExists = this.teams.find(team => team.Country_id === this.teamForm.get('team_name')?.value);
    // if (isTeamExists) {
    //   alert("Team is already exists choose different country");
    //   return
    // }
    let payload = this.newTeams.find(team => team.Country_id === this.teamForm.get('team_name')?.value);
    payload.Matches = this.teamForm.get('Matches')?.value;
    payload.Points = this.teamForm.get('Points')?.value;
    payload.Rating = this.teamForm.get('Rating')?.value;
    payload.no = this.teams.length + 1;
    this.teams.push(payload);
    this.mockService.updateTeam(this.teams);
    document.getElementById('btn-close')?.click();
  }
  // loadForm(): void {
  //   this.submitted = false;
  //   this.teamForm = this.fb.group({
  //     team_name: [this.editData?.name || '', Validators.required],
  //     Matches: [this.editData?.startDate || null, Validators.required],
  //     Points: [this.editData?.endDate || null, Validators.required],
  //     Rating: [this.editData?.format || '', Validators.required],
  //   });
  // }
  // onSubmit() {
  //   this.submitted = true;
  //   if (this.teamForm.invalid) {
  //     return;
  //   }
  //   let payload = this.teamForm.value;
  //   let team_id = this.teams[this.teams.length - 1].team_id;
  //   payload.team_id = Number(team_id) + 1;
  //   payload.no = Number(team_id) + 1;
  //   this.teams.push(payload);
  //   this.mockService.updateTournament(this.teams);
  //   document.getElementById('btn-close')?.click();
  // }

  searchTeam() {
    const searchTextTrimmed = this.searchText.trim().toLowerCase();

    if (searchTextTrimmed) {
      this.teams = this.mockService.getTeams().filter((team: any) => {
        return team.team_name.toLowerCase().includes(searchTextTrimmed);
      });
    } else {
      this.teams = this.mockService.getTeams();
    }
  }



  openTeamModal(tournament?: any): void {
    this.newTeams = this.newTeams.filter(item1 =>
      !this.teams.some(item2 => item2.team_id === item1.team_id)
    );
    this.editData = tournament || {};
    if (tournament) {
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
    }
    this.loadForm();
    this.tournamentModal = new bootstrap.Modal(
      document.getElementById('tournamentModal')!
    );
    this.tournamentModal.show();
  }
}
