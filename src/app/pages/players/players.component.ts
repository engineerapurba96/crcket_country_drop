import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import _ from 'lodash';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MOCK_DATA } from '../../shared/mock-data';
declare const bootstrap: any;

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectComponent
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent {
  teams: any = [];
  players: Array<any> = [];
  team: any = {};
  team_id: any;
  pagination: any = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    lastPage: 0,
    data: []
  };
  searchText: string = '';
  _: any = _;
  tournamentModal: any;
  playerForm: any;
  submitted: boolean = false;
  teams_: any;
  constructor(private fb: FormBuilder, private mockService: MockDataService, private router: Router) {
    this.team_id = _.last(this.router.url.split("/"));
    this.team_id = this.team_id != "players" ? this.team_id : null
    this.players = this.mockService.getTeamPlayers(this.team_id);
    this.team = this.team_id ? (this.mockService.getTeams(this.team_id) || {}) : {};
    this.loadPlayers();
    console.log(this.team);
    this.loadForm();
  }
  loadForm(): void {
    this.submitted = false;
    this.playerForm = this.fb.group({
      Player_name: ['', Validators.required],
      team_name: ['', Validators.required],
      Player_id: [''],
      Country_id: ['', Validators.required],
      Country_name: ['', Validators.required],
      Country: ['', Validators.required],
      team_id: ['', Validators.required],
      Points: ['', Validators.required],
      careerbest: ['', Validators.required],
    });
  }

  loadPlayers() {
    const allPlayers = this.mockService.getTeamPlayers(this.team_id);
    this.pagination.totalItems = allPlayers.length;
    this.pagination.data = allPlayers.slice(0, this.pagination.itemsPerPage);
    this.pagination.lastPage = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
  }
  

  pageChanged(event: "next" | "prev"): void {
    this.pagination.currentPage = event == "next" ? this.pagination.currentPage + 1 : this.pagination.currentPage - 1;
    const startItem = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endItem = this.pagination.currentPage * this.pagination.itemsPerPage;
    this.pagination.data = this.players.slice(startItem, endItem);
  }


  searchTeam() {
    const query = this.searchText.trim().toLowerCase();
    let filteredPlayers = this.mockService.getTeamPlayers(this.team_id);
  
    if (query) {
      filteredPlayers = filteredPlayers.filter((player: any) =>
        player.Player_name.toLowerCase().includes(query) ||
        player.team_name.toLowerCase().includes(query)
      );
    }
  
    this.pagination.totalItems = filteredPlayers.length;
    this.pagination.lastPage = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
    this.pagination.data = filteredPlayers.slice(0, this.pagination.itemsPerPage);
  }
  


  openTeamModal(tournament?: any): void {
    this.teams_ = this.mockService.getTeams()
    this.tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal')!);
    this.tournamentModal.show();
  }
  onSubmit() {
    const newPlayer = {
      no: this.team_id??this.playerForm.value.team_name.team_id,
      Player_name: this.playerForm.get('Player_name').value,
      Player_id: this.players.length+1,
      Country_id: this.team_id?this.team.Country_id:this.playerForm.value.team_name.Country_id,
      Country_name: this.team_id?this.team.Country:this.playerForm.value.team_name.Country,
      Country: this.team_id?this.team.shortname:this.playerForm.value.team_name.shortname,
      team_id: this.team_id??this.playerForm.value.team_name.team_id,
      team_name:this.team_id?this.team.team_name:this.playerForm.value.team_name.Country,
      Points: this.team_id?this.team.Points:this.playerForm.value.Points,
      careerbest: this.playerForm.value.careerbest,
    };
    this.mockService.addPlayer(newPlayer.team_id, newPlayer);
    this.loadPlayers();
    document.getElementById('btn-close')?.click();
  }
  get f() { return this.playerForm.controls; }
}
