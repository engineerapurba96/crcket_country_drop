import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { TeamsComponent } from './teams/teams.component';

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "",
        redirectTo: "teams",
        pathMatch: "full"
      },
      {
        path: "teams",
        component: TeamsComponent
      },
      {
        path: "team-detail/:id",
        loadComponent: () => import("./players/players.component").then(m => m.PlayersComponent)
      },
      {
        path: "players",
        loadComponent: () => import("./players/players.component").then(m => m.PlayersComponent)
      },
      {
        path: "player-detail/:country_id/:id",
        loadComponent: () => import("./player-detail/player-detail.component").then(m => m.PlayerDetailComponent)
      },
      {
        path: "tournaments",
        loadComponent: () => import("./tournaments/tournaments.component").then(m => m.TournamentsComponent)
      },
      {
        path:  'points-table/:id',
        loadComponent: () => import("./points-table/points-table.component").then(m => m.PointsTableComponent)
      },
      {
        path: "schedules",
        loadComponent: () => import("./schedules/schedules.component").then(m => m.SchedulesComponent)
      },
      {
        path: "match-setup/:id",
        loadComponent: () => import("./match-setup/match-setup.component").then(m => m.MatchSetupComponent)
      },
      {
        path: "score-card/:id",
        loadComponent: () => import("./score-card/score-card.component").then(m => m.ScoreCardComponent)
      },
      {
        path: "score-details/:id",
        loadComponent: () => import("./score-details/score-details.component").then(m => m.ScoreDetailsComponent)
      },

      {
        path: "**",
        redirectTo: "tournaments",
        pathMatch: "full"
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {

}
