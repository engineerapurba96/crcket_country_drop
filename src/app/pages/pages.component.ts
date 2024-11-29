import { Component } from '@angular/core';

@Component({
  selector: 'app-pages',
  standalone: false,
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {

  sidebarOpen: boolean = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

}
