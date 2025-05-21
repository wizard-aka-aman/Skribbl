import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-layout',
  imports: [CommonModule , RouterLink , FormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent { 
  groupId: string | null = null;
  userinput :string = ''
  user :string = ''
  createRoom() {
    this.groupId = crypto.randomUUID(); // Generates a random GUID
  } 
  constructor(private toastr: ToastrService) { 
    
  }
  copygroupId() {
    if (this.groupId) {
      navigator.clipboard.writeText(this.groupId); 
      this.toastr.success("Room ID copied to clipboard!" ,"Success")
    }
  }

}
