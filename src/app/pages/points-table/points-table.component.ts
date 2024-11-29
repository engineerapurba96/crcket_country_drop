import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-points-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './points-table.component.html',
  styleUrl: './points-table.component.scss',
})
export class PointsTableComponent {
  filteredTeams: any[] = [];
  searchText: string = '';
  teams: any[] = [];
  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((param: any) => {
      console.log(param);
      this.getTeam(param.id)
    })
  }
  // getTeam(format: any) {
  //   const tournaments: any = localStorage.getItem('Tournaments');
  //   const tournamentsTeam = JSON.parse(tournaments)
  //   this.teams = tournamentsTeam.find((x: any) => x.format == format).participants;
  //   this.filteredTeams = [...this.teams];
  //   console.log(this.teams);

  // }
  getTeam(format: any) {
    const tournaments: any = localStorage.getItem('Tournaments');
    const tournamentsTeam = JSON.parse(tournaments);
    const teamsData = tournamentsTeam.find((x: any) => x.format == format).participants;
    const teamPoints = JSON.parse(localStorage.getItem('teamPoints') || '[]');

    this.teams = teamsData.map((team: any) => {
      const teamStats = teamPoints.find((point: any) => point.teamName === team.team_name);

      if (teamStats) {
        let nrr = 0;
        if (teamStats.matchesWon - teamStats.matchesLost !== 0) {
          nrr = teamStats.matchesPlayed / (teamStats.matchesWon - teamStats.matchesLost);
          nrr = isFinite(nrr) && !isNaN(nrr) ? nrr : 0;
        }

        return {
          ...team,
          matches: teamStats.matchesPlayed || 0,
          wins: teamStats.matchesWon || 0,
          losses: teamStats.matchesLost || 0,
          points: teamStats.points || 0,
          nrr: nrr,
        };
      }

      return {
        ...team,
        matches: 0,
        wins: 0,
        losses: 0,
        points: 0,
        nrr: 0,
      };
    });

    this.filteredTeams = [...this.teams];
    console.log(this.teams);
  }


  searchTeam() {
    if (this.searchText.trim() === '') {
      this.filteredTeams = [...this.teams];
    } else {
      this.filteredTeams = this.teams.filter(team =>
        team.team_name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

}
