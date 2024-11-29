import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import _ from 'lodash';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.scss'
})
export class PlayerDetailComponent {

  player: any = {};
  player_id: any = null;
  countryId: string | null;

  constructor(private route: ActivatedRoute, private router: Router, private mockService: MockDataService) {
    this.player_id = this.route.snapshot.paramMap.get('id');
    this.countryId = this.route.snapshot.paramMap.get('country_id');
    this.player = this.mockService.getPlayer(this.player_id, this.countryId);
    this.player['careerStats'] = _.map(['Test','ODI','T20'],(format)=>{
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
        'BowlingRuns': '-',
        'Wickets': '-',
        'Economy': '-',
        'BowlingAvg': '-',
        'BowlingStrikeRate': '-',
        ..._.find(this.player?.careerStats,{format: format})
      }
    });
    console.log(this.player);
    
  }

}
