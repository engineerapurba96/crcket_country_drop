import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import { Router } from '@angular/router';
import _ from 'lodash';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './score-card.component.html',
  styleUrl: './score-card.component.scss',
})
export class ScoreCardComponent {

  teamA: any = {};
  teamB: any = {};
  currentBattingTeam = 0;
  currentBowlingTeam = 1;
  totalOvers = 0;
  firstInningsOver = false;
  secondInningsOver = false;
  matchResult = '';
  currentStriker: string = '';
  currentNonStriker: string = '';
  currentBowler: string = '';

  scheduleIndex: any;
  scheduleDet: any;
  _: any = _;


  constructor(private router: Router, private fb: FormBuilder, private mockService: MockDataService) {
    this.scheduleIndex = _.last(this.router.url.split("/"));
    this.scheduleDet = this.mockService.getSchedules()[this.scheduleIndex as any];
    if (_.isEmpty(this.scheduleDet)) {
      this.router.navigate(['/schedules']);
    } else if (_.isUndefined(this.scheduleDet?.teamA?.players) || this.scheduleDet?.teamA?.players?.length == 0) {
      this.router.navigate(['/match-setup/' + this.scheduleIndex]);
    } else {
      this.teamA['score'] = Array.from({ length: this.totalOvers }, (_, i) => ({
        overNumber: i + 1,
        scoreCard: Array(6).fill(''),
      }));
      this.teamB['score'] = Array.from({ length: this.totalOvers }, (_, i) => ({
        overNumber: i + 1,
        scoreCard: Array(6).fill(''),
      }));
      this.getMatchSetup();
    }
  }

  getMatchSetup() {
    this.totalOvers = this.scheduleDet.overs;
    this.scheduleDet.teamA.players = this.scheduleDet.teamA.players.map((player: any, index: any) => ({
      Player_id: player?.Player_id,
      Player_name: player?.Player_name,
      runs: 0,
      ballsFaced: 0,
      isOut: false,
      fours: 0,
      sixes: 0,
      bowling: 0,
      wickets: 0,
      bowlRun: 0,
      bowlFour: 0,
      bowlSix: 0,
      wide: 0,
      nb: 0,
    }));
    this.scheduleDet.teamA.score = Array.from({ length: this.totalOvers }, (_, i) => ({
      overNumber: i + 1,
      scoreCard: Array(6).fill(''),
    }));
    this.scheduleDet.teamA.totalRuns = 0;
    this.scheduleDet.teamA.wickets = 0;
    this.scheduleDet.teamA.extras = 0;
    this.scheduleDet.teamA.totalOvers = this.totalOvers;
    this.scheduleDet.teamB.players = this.scheduleDet.teamB.players.map((player: any, index: any) => ({
      Player_id: player.Player_id,
      Player_name: player.Player_name,
      runs: 0,
      ballsFaced: 0,
      isOut: false,
      fours: 0,
      sixes: 0,
      bowling: 0,
      wickets: 0,
      bowlRun: 0,
      bowlFour: 0,
      bowlSix: 0,
      wide: 0,
      nb: 0,
    }));
    this.scheduleDet.teamB.score = Array.from({ length: this.totalOvers }, (_, i) => ({
      overNumber: i + 1,
      scoreCard: Array(6).fill(''),
    }));
    this.scheduleDet.teamB.totalRuns = 0;
    this.scheduleDet.teamB.wickets = 0;
    this.scheduleDet.teamB.extras = 0;
    this.scheduleDet.totalOvers = this.totalOvers;
    this.teamA = this.scheduleDet.teamA;
    this.teamB = this.scheduleDet.teamB;
    return this.scheduleDet;
  }
  ballResult(runs?: number | string, extraType?: string) {
    if (!this.currentStriker || !this.currentNonStriker || !this.currentBowler) {
      alert('Please select  Striker, Non-Striker & Bowler');
      return;
    }
    const currentTeam = this.currentBattingTeam === 0 ? this.teamA : this.teamB;
    const currentOver = currentTeam.score.find((over: any) =>
      over.scoreCard.includes('')
    );
    if (!currentOver) {
      console.log('All overs are completed!');
      alert('All overs are completed!');
      return;
    }

    if (_.isUndefined(extraType) && !_.isUndefined(runs)) {
      this.updateBolwerRuns(runs);
      this.updatePlayerRuns(runs, currentTeam);
    }
    else if (!_.isUndefined(extraType)) {
      currentTeam.extras += 1;
      currentOver.scoreCard.push('');
    }
    else {
      this.updateBolwerRuns('W');
      this.updatePlayerRuns('W', currentTeam);
    }
    const ballIndex = currentOver.scoreCard.findIndex(
      (ball: any) => ball === ''
    );
    if (ballIndex !== -1) {
      currentOver.scoreCard[ballIndex] = runs;
      if (typeof runs === 'number' && _.isUndefined(extraType)) {
        if (runs === 1) {
          this.switchStriker();
        }
        currentTeam.totalRuns += runs;
      } else if (extraType === 'WD' || extraType === 'NB') {
        currentOver.scoreCard[ballIndex] = extraType;
        currentTeam.extras += 1;
        currentTeam.totalRuns += runs;
        this.updateBolwerRuns(extraType);
      } else {
        currentOver.scoreCard[ballIndex] = 'W';
        currentTeam.wickets += 1;
        if ((this.getCurrentTeamPlayers().length - 1) == currentTeam.wickets) {
          if (this.firstInningsOver) this.determineMatchResult();
          else this.startNextInnings();
        }
      }
      if (_.isEmpty(currentTeam.score.find((over: any) => over.scoreCard.includes('')))) {
        if (this.firstInningsOver) this.determineMatchResult();
        else this.startNextInnings();
      }
    } else {
      console.log('This over is already complete!');
    }
    console.log(currentOver);
    console.log(currentOver.scoreCard);
    const filteredOver = currentOver.scoreCard.filter((item: any) => item !== 'WD' && item !== 'NB' && item !== '');
    console.log(filteredOver.length);
    if (filteredOver.length == 6) {
      this.currentBowler = '';
      this.switchStriker();
    }

  }
  updateBolwerRuns(runs: any){
    const bolwerTeam = this.currentBattingTeam === 0 ? this.teamB : this.teamA;
    const bolwer = bolwerTeam.players.find(
      (player: any) => player.Player_name === this.currentBowler
    );
    bolwer.bowling +=1;
    if (runs === 'W') {
      bolwer.wickets += 1;
      return
    }
    if (runs === 'WD') {
      bolwer.runs += 1;
      bolwer.wide += 1;
      return
    }
    if (runs === 'NB') {
      bolwer.runs += 1;
      bolwer.nb += 1;
      return
    }
    if (runs === 6) bolwer.bowlSix += 1;
    if (runs === 4) bolwer.bowlFour += 1;
    bolwer.runs += runs;
  }
  updatePlayerRuns(runs: number | string, currentTeam: any) {
    const striker = currentTeam.players.find(
      (player: any) => player.Player_name === this.currentStriker
    );
    if (runs === 'W') {
      this.currentStriker = '';
      if (striker) striker.isOut = true;
      //this.switchStriker();
    } else {
      if (runs === 6) striker.sixes += 1;
      if (runs === 4) striker.fours += 1;
      if (striker) striker.bowlRun += runs;
    }
    if (striker) striker.ballsFaced += 1;
  }
  startNextInnings() {
    this.firstInningsOver = true;
    this.currentBowlingTeam = this.currentBowlingTeam === 0 ? 1 : 0;
    this.currentBattingTeam = this.currentBattingTeam === 0 ? 1 : 0;
    this.currentStriker = '';
    this.currentNonStriker = '';
    alert(`First innings over! ${this.scheduleDet.teamA.team_name} scored ${this.teamA.totalRuns} runs for ${this.teamA.wickets} wickets in ${this.totalOvers} overs.`);
  }
  determineMatchResult() {
    if (this.teamB.totalRuns > this.teamA.totalRuns) {
      this.matchResult = `${this.teamB.team_name} wins by ${this.teamB.totalRuns - this.teamA.totalRuns
        } runs!`;
    } else if (this.teamA.totalRuns > this.teamB.totalRuns) {
      this.matchResult = `${this.teamA.team_name} wins by ${this.teamA.totalRuns - this.teamB.totalRuns
        } runs!`;
    } else {
      this.matchResult = `The match is a draw!`;
    }
    this.secondInningsOver = true;
    alert(this.matchResult);
  }
  getCurrentTeamPlayers() {
    return this.scheduleDet[this.currentBattingTeam === 0 ? 'teamA' : 'teamB'].players;
  }
  getCurrentBowlPlayers() {
    return this.scheduleDet[this.currentBowlingTeam === 0 ? 'teamA' : 'teamB'].players;
  }
  switchStriker() {
    const temp = this.currentStriker;
    this.currentStriker = this.currentNonStriker;
    this.currentNonStriker = temp;
  }
  resetMatch() {
    this.teamA.totalRuns = 0;
    this.teamB.totalRuns = 0;
    this.teamA.wickets = 0;
    this.teamB.wickets = 0;
    this.teamA.extras = 0;
    this.teamB.extras = 0;
    this.teamA.score = [];
    this.teamB.score = [];
    this.firstInningsOver = false;
    this.secondInningsOver = false;
    this.matchResult = '';
    this.currentBattingTeam = 0;
  }
  save_score() {
    let score = [this.teamA, this.teamB];
    localStorage.setItem('live_cricket_score', JSON.stringify(score));
    const schedules = this.mockService.getSchedules();
    const teamA_Balls_faced = _.sum(_.map(this.teamA.players, 'ballsFaced'));
    const teamB_Balls_faced = _.sum(_.map(this.teamB.players, 'ballsFaced'));
    schedules[this.scheduleIndex] = {
      ...schedules[this.scheduleIndex],
      'matchResult': this.matchResult,
      teamA: {
        ...schedules[this.scheduleIndex].teamA,
        'scoreCardDet': {
          'overWiseScore': this.teamA.score,
          'playerWiseScore': this.scheduleDet.teamA.players,
          'ballsFaced': teamA_Balls_faced,
          'totalRuns': this.teamA.totalRuns,
          'wickets': this.teamA.wickets,
          'extras': this.teamA.extras,
          'overs': Math.floor(teamA_Balls_faced / 6) + '.' + (teamA_Balls_faced % 6)
        },
      },
      teamB: {
        ...schedules[this.scheduleIndex].teamB,
        'scoreCardDet': {
          'overWiseScore': this.teamB.score,
          'playerWiseScore': this.scheduleDet.teamB.players,
          'totalRuns': this.teamB.totalRuns,
          'ballsFaced': teamB_Balls_faced,
          'wickets': this.teamB.wickets,
          'extras': this.teamB.extras,
          'overs': Math.floor(teamB_Balls_faced / 6) + '.' + (teamB_Balls_faced % 6)
        },
      }
    }
    this.mockService.updatePlayerCarrerDetails({
      teamA: {
        'team_id': schedules[this.scheduleIndex].teamA.team_id,
        'playerWiseScore': schedules[this.scheduleIndex].teamA.scoreCardDet.playerWiseScore
      },
      teamB: {
        'team_id': schedules[this.scheduleIndex].teamB.team_id,
        'playerWiseScore': schedules[this.scheduleIndex].teamB.scoreCardDet.playerWiseScore
      },
      'format': this.scheduleDet?.format
    })
    localStorage.setItem('Schedules', JSON.stringify(schedules));
    this.router.navigate(['/score-details/' + this.scheduleIndex]);
  }
  onTeamSelect(team: any) {
    this.currentBowlingTeam = team === 0 ? 1 : 0;
  }
}
