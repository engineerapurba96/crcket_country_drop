import { Component } from '@angular/core';
import { MOCK_DATA } from '../../shared/mock-data';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import _ from 'lodash';
import { MockDataService } from '../../shared/services/mock-data/mock-data.service';
import { RouterModule } from '@angular/router';
declare const bootstrap: any;

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './schedules.component.html',
  styleUrl: './schedules.component.scss'
})
export class SchedulesComponent {

  schedules: any = [];
  teams: any = [];
  scheduleForm: any;
  isEditMode: boolean = false;
  editData: any = {};
  submitted: boolean = false;
  scheduleModal: any;
  searchText: string = '';
  _: any = _;
  tournaments: any;

  constructor(private fb: FormBuilder, private mockService: MockDataService) {
    this.tournaments = this.mockService.getTournaments();
    console.log(this.tournaments);
    this.teams = this.mockService.getTeams();
    this.teams.forEach((element:any) => {
      element.team_id = Number.parseInt(element.team_id)

    });
    console.log(this.teams);

    this.schedules = this.mockService.getSchedules();
  }

  ngOnInit(): void {
    this.loadForm();
  }

  searchTeam() {
    const searchValue = this.searchText.trim().toLowerCase();
    if (!searchValue) {
      this.schedules = this.mockService.getSchedules();
      return;
    }
    this.schedules = this.mockService.getSchedules().filter((schedule: any) => {
      const teamAName = schedule.teamA?.team_name?.toLowerCase() || '';
      const teamBName = schedule.teamB?.team_name?.toLowerCase() || '';
      const venue = schedule.venue?.toLowerCase() || '';
      const format = schedule.format?.toLowerCase() || '';
      const hostName = schedule.hostName?.toLowerCase() || '';

      return (
        teamAName.includes(searchValue) ||
        teamBName.includes(searchValue) ||
        venue.includes(searchValue) ||
        format.includes(searchValue) ||
        hostName.includes(searchValue)
      );
    });
  }


  loadForm(): void {
    this.submitted = false;
    this.scheduleForm = this.fb.group({
      tournament: ['', Validators.required],
      teamA: [this.editData?.teamA?.team_id || '', Validators.required],
      teamB: [this.editData?.teamB?.team_id || '', Validators.required],
      date: [this.editData?.date || null, Validators.required],
      time: [this.editData?.time || null, Validators.required],
      venue: [this.editData?.venue || '', Validators.required],
      format: [this.editData?.format || '', Validators.required],
      hostId: [this.editData?.hostId || '', Validators.required],
      hostName: [this.editData?.hostName || '']
    });
    this.scheduleForm.get('teamA')?.valueChanges.subscribe((teamA: any) => {
      this.scheduleForm.get('teamB')?.setValue('');
      this.scheduleForm.get('teamB')?.setValidators([Validators.required]);
    });
    this.scheduleForm.get('teamB')?.valueChanges.subscribe((teamB: any) => {
      if (teamB) {
        if (this.f.teamA.value == teamB) {
          this.scheduleForm.get('teamB')?.setValue('');
          this.scheduleForm.get('teamB')?.updateValueAndValidity();
          this.scheduleForm.get('teamB')?.setErrors({ 'sameTeam': true });
        }
      }
    });
  }

  get f() { return this.scheduleForm.controls; }

  openScheduleModal(schedule?: any): void {
    this.editData = schedule || {};
    if (schedule) {
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
    }
    this.loadForm();
    this.scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal')!);
    this.scheduleModal.show();
  }
  onSubmit(): void {
    console.log(this.scheduleForm.value);

    this.submitted = true;
    if (this.scheduleForm.invalid) {
      return;
    }
    let payload = this.scheduleForm.value;
    console.log(payload)
    // payload['tournament'] = _.find(this.teams, { 'id': payload.tournament })?.name;
    payload['hostName'] = _.find(this.teams, { 'team_id': Number.parseInt(payload.hostId) })?.team_name;
    payload['teamA'] = _.find(this.teams, { 'team_id': Number.parseInt(payload.teamA) });
    payload['teamB'] = _.find(this.teams, { 'team_id': Number.parseInt(payload.teamB) });
    if (this.isEditMode) {
      const index = this.schedules.findIndex((schedule: any) => schedule.id === this.editData.id);
      this.schedules[index] = payload;
    }
    else {
      this.schedules.push(payload);
    }
    this.mockService.updateSchedule(this.schedules);
    document.getElementById("btn-close")?.click();
  }

  deleteSchedule(schedule: any): void {
    this.schedules = this.schedules.filter((item: any) => item.id !== schedule.id);
    this.mockService.updateSchedule(this.schedules);  // Update the data in local storage
  }

}
