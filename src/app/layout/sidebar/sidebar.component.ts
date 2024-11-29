import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() sidebarOpen: boolean = true;
  @Output() sidebarToggle: EventEmitter<boolean> = new EventEmitter();

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarToggle.emit(this.sidebarOpen);
  }
}
