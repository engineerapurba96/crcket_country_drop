import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import { Router, RouterModule } from '@angular/router';
import _ from 'lodash';

@Component({
  selector: 'app-score-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './score-details.component.html',
  styleUrls: ['./score-details.component.scss'],
})
export class ScoreDetailsComponent {
  cricketScore: any;

  scheduleIndex: any;
  scheduleDet: any;
  _: any = _;

  constructor(private router: Router, private mockService: MockDataService) {
    this.scheduleIndex = _.last(this.router.url.split("/"));
    this.scheduleDet = this.mockService.getSchedules()[this.scheduleIndex as any]; // Get the schedule from the mock data
    if (_.isEmpty(this.scheduleDet)) {
      this.router.navigate(['/schedules']);
    } else if (_.isUndefined(this.scheduleDet?.teamA?.players) || this.scheduleDet?.teamA?.players?.length == 0) {
      this.router.navigate(['/match-setup/' + this.scheduleIndex]);
    } else if (_.isUndefined(this.scheduleDet?.teamA?.scoreCardDet)) {
      this.router.navigate(['/score-card/' + this.scheduleIndex]);
    }
    this.cricketScore = [this.scheduleDet.teamA, this.scheduleDet.teamB];
  }
  yetToBat(players: any) {
    return players.filter((player: any) => player.ballsFaced === 0).map((player: any) => player.Player_name);
  }
  getOvers(balls: number): string {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;   
    return `${overs}.${remainingBalls}`;
  }
  

  // getMatchResult(): string {
  //   const teamA = this.cricketScore[0];
  //   const teamB = this.cricketScore[1];

  //   const teamATotalRuns = teamA.scoreCardDet.totalRuns;
  //   const teamBTotalRuns = teamB.scoreCardDet.totalRuns;

  //   if (teamATotalRuns > teamBTotalRuns) {
  //     const margin = teamATotalRuns - teamBTotalRuns;
  //     return `${teamA.team_name} won by ${margin} runs`;
  //   } else if (teamBTotalRuns > teamATotalRuns) {
  //     const margin = teamBTotalRuns - teamATotalRuns;
  //     return `${teamB.team_name} won by ${margin} runs`;
  //   } else {
  //     return 'The match is a tie';
  //   }
  // }

  getMatchResult(): string {
    const teamA = this.cricketScore[0];
    const teamB = this.cricketScore[1];
  
    const teamATotalRuns = teamA.scoreCardDet.totalRuns;
    const teamBTotalRuns = teamB.scoreCardDet.totalRuns;
  
    let resultMessage = '';
    
    // Initialize teamPoints for both teams
    const teamPoints = [
      {
        teamName: teamA.team_name,
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        totalRuns: 0
      },
      {
        teamName: teamB.team_name,
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        totalRuns: 0
      }
    ];
  
    // Retrieve stored team data from localStorage, if any
    const storedTeamPoints = JSON.parse(localStorage.getItem('teamPoints') || '[]');
  
    // If there is stored data, merge with current team points
    if (storedTeamPoints.length > 0) {
      const teamAData = storedTeamPoints.find((team: any) => team.teamName === teamA.team_name);
      const teamBData = storedTeamPoints.find((team: any) => team.teamName === teamB.team_name);
  
      // Update team points if found in localStorage
      if (teamAData) {
        teamPoints[0] = { ...teamAData };
      }
      if (teamBData) {
        teamPoints[1] = { ...teamBData };
      }
    }
  
    // Update total runs
    teamPoints[0].totalRuns += teamATotalRuns;
    teamPoints[1].totalRuns += teamBTotalRuns;
  
    // Increment matches played for both teams
    teamPoints[0].matchesPlayed += 1;
    teamPoints[1].matchesPlayed += 1;
  
    // Determine match outcome
    if (teamATotalRuns > teamBTotalRuns) {
      const margin = teamATotalRuns - teamBTotalRuns;
      teamPoints[0].points += 2; // Team A wins
      teamPoints[1].points += 0; // Team B loses
      teamPoints[0].matchesWon += 1;
      teamPoints[1].matchesLost += 1;
      resultMessage = `${teamA.team_name} won by ${margin} runs`;
    } else if (teamBTotalRuns > teamATotalRuns) {
      const margin = teamBTotalRuns - teamATotalRuns;
      teamPoints[1].points += 2; // Team B wins
      teamPoints[0].points += 0; // Team A loses
      teamPoints[1].matchesWon += 1;
      teamPoints[0].matchesLost += 1;
      resultMessage = `${teamB.team_name} won by ${margin} runs`;
    } else {
      teamPoints[0].points += 1; // Tie
      teamPoints[1].points += 1;
      resultMessage = 'The match is a tie';
    }
  
    // Save the updated team points to localStorage
    localStorage.setItem('teamPoints', JSON.stringify(teamPoints));
  
    return resultMessage;
  }

}
