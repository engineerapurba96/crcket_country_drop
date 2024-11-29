import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import _, { over } from 'lodash';

@Component({
  selector: 'app-match-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgSelectModule],
  templateUrl: './match-setup.component.html',
  styleUrl: './match-setup.component.scss',
})
export class MatchSetupComponent {
  
  teamDetailsForm: any = {};
  playerDetails: any = {
    teamA: [],
    teamB: [],
    selectedTeamA_players: [],
    selectedTeamB_players: []
  }
  scheduleDet: any = {};
  submitted: boolean = false;
  scheduleIndex: any = null;
  _: any = _;

  constructor(private router: Router, private mockService: MockDataService,private fb: FormBuilder) { 
    this.scheduleIndex = _.last(this.router.url.split("/"));
    this.scheduleDet = this.mockService.getSchedules()[this.scheduleIndex as any]; // Get the schedule from the mock data
    if(_.isEmpty(this.scheduleDet)) {
      this.router.navigate(['/schedules']);
    }
    this.playerDetails.teamA = _.map(this.mockService.getTeamPlayers(this.scheduleDet?.teamA?.team_id),(e)=>_.pick(e,['Player_id','Player_name'])); // Get the players from the mock data
    this.playerDetails.teamB = _.map(this.mockService.getTeamPlayers(this.scheduleDet?.teamB?.team_id),(e)=>_.pick(e,['Player_id','Player_name'])); // Get the players from the mock data
    this.loadForm();
  }

  loadForm() {
    this.submitted = false;
    this.teamDetailsForm = this.fb.group({
      overs: [this.scheduleDet?.overs || "", Validators.required],
      teamA: this.fb.group({
        players: [ _.map(this.scheduleDet?.teamA?.players,'Player_id') || null, Validators.required],
        wicketKeeper: [_.get(this.scheduleDet?.teamA?.wicketKeeper,'Player_id') || "", Validators.required],
        captain: [_.get(this.scheduleDet?.teamA?.captain,'Player_id') || "", Validators.required]
      }),
      teamB: this.fb.group({
        players: [_.map(this.scheduleDet?.teamB?.players,'Player_id') || null, Validators.required],
        wicketKeeper: [_.get(this.scheduleDet?.teamB?.wicketKeeper,'Player_id') || "", Validators.required],
        captain: [_.get(this.scheduleDet?.teamB?.captain,'Player_id') || "", Validators.required]
      })
    });
    if(_.isEmpty(this.teamAf.players.value)) {
      this.teamAf.players.setValue(_.map(this.playerDetails.teamA,'Player_id'));
    }
    if(_.isEmpty(this.teamBf.players.value)) {
      this.teamBf.players.setValue(_.map(this.playerDetails.teamB,'Player_id'));
    }
    this.teamAf.players.valueChanges.subscribe((players: any) => {
      if(this.teamAf.wicketKeeper.value && !players.includes(this.teamAf.wicketKeeper.value)) {
        this.teamAf.wicketKeeper.setValue("");
      }
      if(this.teamAf.captain.value && !players.includes(this.teamAf.captain.value)) {
        this.teamAf.captain.setValue("");
      }
    });
    this.teamBf.players.valueChanges.subscribe((players: any) => {
      if(this.teamBf.wicketKeeper.value && !players.includes(this.teamBf.wicketKeeper.value)) {
        this.teamBf.wicketKeeper.setValue("");
      }
      if(this.teamBf.captain.value && !players.includes(this.teamBf.captain.value)) {
        this.teamBf.captain.setValue("");
      }
    });
  }

  get f () { return this.teamDetailsForm.controls; }

  get teamAf () { return this.teamDetailsForm.controls.teamA.controls; }

  get teamBf () { return this.teamDetailsForm.controls.teamB.controls; }

  selectAll(team: string) {
    if(team === 'teamA') {
      if(this.playerDetails.teamA.length == this.teamAf.players.value.length) 
        this.teamAf.players.setValue([]);
      else 
        this.teamAf.players.setValue(_.map(this.playerDetails.teamA,'Player_id'));
    } else {
      if(this.playerDetails.teamB.length == this.teamBf.players.value.length) 
        this.teamBf.players.setValue([]);
      else 
      this.teamBf.players.setValue(_.map(this.playerDetails.teamB,'Player_id'));
    }
  }

  unselectAll(team: string) {
    if(team === 'teamA') {
      this.teamAf.players.setValue([]);
    } else {
      this.teamBf.players.setValue([]);
    }
  }

  saveMatchDetails() {
    this.submitted = true;
    if(this.teamDetailsForm.invalid) return;
    if(this.teamAf.players.value.length != this.teamBf.players.value.length) {
      alert(`${this.scheduleDet.teamA.team_name} has ${this.teamAf.players.value.length} players and ${this.scheduleDet.teamB.team_name} has ${this.teamBf.players.value.length} players. Please select equal number of players for both the teams.`);
      return;
    }
    let payload = this.teamDetailsForm.value;
    payload = {
      overs: payload.overs,
      teamA: {
        'team_id': this.scheduleDet.teamA.team_id,
        'team_name': this.scheduleDet.teamA.team_name,
        'players': _.map(payload['teamA']['players'],(Player_id)=>_.find(this.playerDetails.teamA,{ Player_id })),
        'wicketKeeper': _.find(this.playerDetails.teamA,{ Player_id: payload['teamA']['wicketKeeper'] }),
        'captain': _.find(this.playerDetails.teamA,{ Player_id: payload['teamA']['captain'] })
      },
      teamB: {
        'team_id': this.scheduleDet.teamB.team_id,
        'team_name': this.scheduleDet.teamB.team_name,
        'players': _.map(payload['teamB']['players'],(Player_id)=>_.find(this.playerDetails.teamB,{ Player_id })),
        'wicketKeeper': _.find(this.playerDetails.teamB,{ Player_id: payload['teamB']['wicketKeeper'] }),
        'captain': _.find(this.playerDetails.teamB,{ Player_id: payload['teamB']['captain'] })
      }
    }
    this.scheduleDet = { ...this.scheduleDet, ...payload };
    const schedules = this.mockService.getSchedules();
    schedules[this.scheduleIndex] = this.scheduleDet;
    localStorage.setItem('Schedules', JSON.stringify(schedules));
    this.router.navigate(['/score-card/'+this.scheduleIndex]);
  }
  
}
