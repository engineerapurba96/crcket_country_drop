import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  sidebarOpen: boolean = true;
  @Output() toggleSidebar: EventEmitter<void> = new EventEmitter();

  onToggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.toggleSidebar.emit();
  }

  goToProfile() {
    console.log('Navigating to profile...');
  }
}
