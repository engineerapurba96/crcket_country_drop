import { Injectable } from '@angular/core';
import { MOCK_DATA } from '../../mock-data';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor() { 
    if(_.isEmpty(localStorage.getItem("Teams"))) {
      localStorage.setItem("Teams",JSON.stringify(MOCK_DATA.teams));
      localStorage.setItem("Players",JSON.stringify(MOCK_DATA.players));
      localStorage.setItem("Tournaments",JSON.stringify(MOCK_DATA.tournaments));
      localStorage.setItem("Schedules",JSON.stringify(MOCK_DATA.schedules));
    }
  }

  getTeams(teamId?: any): any {
    if(teamId) {
      return _.find(MOCK_DATA.teams,["team_id",teamId]) || {};
    }
    let team: any = JSON.parse(localStorage.getItem("Teams") || '');
    if (team.length > 0) return team
    return MOCK_DATA.teams;
  }
  getNewTeams(): any {
    return MOCK_DATA.newTeam;
  }

  createTeam(team: any) {
    MOCK_DATA.teams.push(team);
  }

  addPlayer(teamId: string, newPlayer: any) {
    let players: any = JSON.parse(localStorage.getItem("Players") || '[]');
    if (!players[teamId]) {
      players[teamId] = [];
    }
    if (players[teamId]) {
      players[teamId].push(newPlayer);
      localStorage.setItem("Players",JSON.stringify(players));
      console.log(JSON.parse(localStorage.getItem("Players") || '[]'));
      
      return _.orderBy(_.flatten(_.map(JSON.parse(localStorage.getItem("Players") || ''),(value: any,key)=>{
        return value;
      })),["Points","no"],"desc")
    } else {
      console.error(`Team with ID ${teamId} not found`);
      return []
    }
  }
  getTeamPlayers(teamId?: any): any[] {
    let players = JSON.parse(localStorage.getItem("Players") || 'null');
    if (!players || Object.keys(players).length === 0) {
      players = MOCK_DATA.players;
      localStorage.setItem("Players", JSON.stringify(MOCK_DATA.players));
    }

    if (teamId) {
      return players[teamId] || [];
    } else {
      return _.orderBy(
        _.flatten(Object.values(players)),
        ["Points", "no"],
        ["desc"]
      );
    }
  }
  
  getTeamPlayerByName(Player_name?: any) {
    const allPlayers = _.flatMap(MOCK_DATA.players);
    return _.find(allPlayers, { Player_name }) || null;
  }

  getPlayer(playerId: any, countryId: any) {
    let players = JSON.parse(localStorage.getItem("Players") || '{}');
      if (players && Object.keys(players).length > 0) {
      return _.find(
        _.flatten(_.map(players, (value: any) => value)),
        (player: any) => player.Player_id == playerId && player.Country_id == countryId
      ) || {};
    }
    
    return {};
  }
  
  getTournaments() {
    return JSON.parse(localStorage.getItem("Tournaments") as any) || [];
  }

  getSchedules() {
    let schedules = JSON.parse(localStorage.getItem("Schedules") || '[]');
    if (schedules.length === 0) {
      localStorage.setItem("Schedules",JSON.stringify(MOCK_DATA.schedules));
    }
    return JSON.parse(localStorage.getItem("Schedules") as any) || [];
  }

  updateTournament(tournaments: any) {
    localStorage.setItem("Tournaments",JSON.stringify(tournaments));
  }

  updateSchedule(schedules: any) {
    localStorage.setItem("Schedules",JSON.stringify(schedules));
  }

  updatePlayerCarrerDetails(data: any) {
    const { teamA, teamB, format } = data;
    const teamAPlayers = this.getCarrerDetails(this.getTeamPlayers(teamA.team_id),teamA,format);
    const teamBPlayers = this.getCarrerDetails(this.getTeamPlayers(teamB.team_id),teamB,format);
    const players = _.reduce(MOCK_DATA.players,(result: any,value: any,key)=>{
      result[key] = _.map(value,(player: any)=>{
        if(player.team_id == teamA.team_id) {
          return _.find(teamAPlayers,{ Player_id: player.Player_id }) || player;
        } else if(player.team_id == teamB.team_id) {
          return _.find(teamBPlayers,{ Player_id: player.Player_id }) || player;
        } else {
          return player;
        }
      });
      return result;
    },{});
    localStorage.setItem("Players",JSON.stringify(players));
  }

  getCarrerDetails(playerDetails: any,matchDetails: any, format: any) {
    return _.map(playerDetails,(player: any)=>{
      if(_.isEmpty(_.find(matchDetails.playerWiseScore,{ 'Player_id': player.Player_id }))) return player;
      player['careerStats'] = _.map(['Test','ODI','T20'],(format)=>{
        return {
          'format': format,
          'Matches': '-',
          'Innings': '-',
          'NotOuts': '-',
          'Runs': '-',
          'HighScore': '-',
          'Avg': '-',
          'BallsFaced': '-',
          'StrikeRate': '-',
          'Hundreds': '-',
          'DoubleHundreds': '-',
          'Fifties': '-',
          'Fours': '-',
          'Sixes': '-',
          'BowlingInnings': '-',
          'Balls': '-',
          'Wickets': '-',
          'Economy': '-',
          'BowlAvg': '-',
          'BowlStrikeRate': '-',          
          ..._.find(player?.careerStats,{ format })
        }
      });
      const index = _.findIndex(player['careerStats'],{ 'format': format });
      const playerInningsDet = _.find(matchDetails.playerWiseScore,{ 'Player_id': player.Player_id }) || {};
      const carrerDet = player['careerStats'][index] || {};
      player['careerStats'][index] = {
        'format': format,
        ..._.isEmpty(playerInningsDet) ? {
          'Matches': (parseInt(carrerDet?.Matches) || 0) + 1,
          ...player['careerStats'][index]
        } : {
          'Matches': (parseInt(carrerDet?.Matches) || 0) + 1,
          'Innings': (parseInt(carrerDet?.Innings) || 0) + playerInningsDet?.ballsFaced > 0 ? 1 : 0,
          'NotOuts': (parseInt(carrerDet?.NotOuts) || 0) + playerInningsDet.ballsFaced > 0 && !playerInningsDet.isOut ? 0 : 1,
          'Runs': (parseInt(carrerDet?.Runs) || 0) + playerInningsDet.runs,
          'HighScore': Math.max((parseInt(carrerDet?.HighScore) || 0),playerInningsDet?.runs),
          'Avg': (((parseInt(carrerDet?.Runs) || 0) + playerInningsDet.runs) / ((parseInt(carrerDet?.Innings) || 0) + playerInningsDet.ballsFaced > 0 ? 1 : 0)).toFixed(2),
          'BallsFaced': (parseInt(carrerDet?.BallsFaced) || 0) + playerInningsDet.ballsFaced,
          'StrikeRate': (((parseInt(carrerDet?.Runs) || 0) + playerInningsDet.runs) / ((parseInt(carrerDet?.BallsFaced) || 0) + playerInningsDet.ballsFaced) * 100).toFixed(2),
          'Hundreds': (parseInt(carrerDet?.Hundreds) || 0) + playerInningsDet.runs >= 100 ? 1 : 0,
          'DoubleHundreds': (parseInt(carrerDet?.DoubleHundreds) || 0) + playerInningsDet.runs >= 200 ? 1 : 0,
          'Fifties': (parseInt(carrerDet?.Fifties) || 0) + playerInningsDet.runs >= 50 ? 1 : 0,
          'Fours': (parseInt(carrerDet?.Fours) || 0) + playerInningsDet.fours || 0,
          'Sixes': (parseInt(carrerDet?.Sixes) || 0) + playerInningsDet.sixes || 0,
          // Bowling Details
          'BowlingInnings': (parseInt(carrerDet?.BowlingInnings) || 0) + playerInningsDet?.bowling > 0 ? 1 : 0,
          'Balls': ((parseInt(carrerDet?.Balls) || 0) + playerInningsDet?.bowling) || 0,
          'Wickets': ((parseInt(carrerDet?.Wickets) || 0) + playerInningsDet?.Wickets) || 0,
          'BowlingRuns': ((parseInt(carrerDet?.BowlingRuns) || 0) + playerInningsDet?.bowlRun) || 0,
        }
      };
      player['careerStats'][index] = {
        'Economy': parseFloat((player['careerStats'][index]['BowlingRuns'] / parseFloat((player['careerStats'][index]['BowlingRuns'] / 6).toFixed(2))).toFixed(2)),
        'BowlingAvg': parseFloat((player['careerStats'][index]['BowlingRuns']/player['careerStats'][index]['Wickets']).toFixed(2)),
        'BowlingStrikeRate': parseFloat((player['careerStats'][index]['Balls']/player['careerStats'][index]['Wickets']).toFixed(2)),
        ...player['careerStats'][index]
      }
      return player;
    });
  }

  updateTeam(tournaments: any) {
    localStorage.setItem("Teams",JSON.stringify(tournaments));
  }

}

