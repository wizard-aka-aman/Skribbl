import { CommonModule } from '@angular/common'; 
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {   Router  } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule   , FormsModule  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent { 
  groupId: string | null = null;
  userinput :string = ''
  user :string = ''
  timer : number = 20;
  rounds : number = 2;
  wordCount : number = 3;
  createRoomBody :any  ={};
  createRoom() {
    this.groupId = crypto.randomUUID(); // Generates a random GUID
  } 
  constructor(private toastr: ToastrService , private serviceSrv : ServiceService , private route : Router){ 
    
  }
  copygroupId() {
    if (this.groupId) {
      navigator.clipboard.writeText(this.groupId); 
      this.toastr.success("Room ID copied to clipboard!" ,"Success")
    }
  }

  PostApiCreateRoom(){
    if(this.user ==""){
      this.toastr.error("Please enter your name" ,"Error")
      return;
    }
    //[routerLink]="['/home']"[queryParams]="{groupId : groupId , user : user}
    this.createRoomBody.timer = this.timer;
    this.createRoomBody.rounds = this.rounds;
    this.createRoomBody.WordCount = this.wordCount;
    this.createRoomBody.RoomName = this.groupId;
    this.createRoomBody.CreatedBy = this.user;
    console.log(this.createRoomBody);

      this.serviceSrv.postCreateGroup(this.createRoomBody).subscribe({
  next: (res: any) => {
    console.log(res);
    this.route.navigate(['/home'], { queryParams: { groupId: this.groupId, user: this.user } });
  },
  error: (err: any) => {
    console.error('Error creating group:', err);
     this.toastr.error("Something went wrong. Please try again.",  'Error');
    // You can also add additional error handling logic here, like displaying a message to the user
  }
});

  }
  GetJoinGroup(){
    if(this.user == ""){
      this.toastr.error("Name can't be Empty")
      return;
    }
    this.serviceSrv.getGroup(this.userinput).subscribe({
  next: (res: any) => {
    console.log(res);
    console.log(Object.keys(res).length);

    if (Object.keys(res).length === 0) {
      this.toastr.error("Group not found", "Error");
    } else {
      this.toastr.success("Group Joined", "Success");
      this.route.navigate(['/home'], { queryParams: { groupId: this.userinput, user: this.user } });
    }
  },
  error: (err: any) => {
    console.error('Error retrieving group:', err);
    this.toastr.error("Something went wrong. Please try again.",  'https://hepefek442.bsite.net/');
  }
});

  }

}
