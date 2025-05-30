import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../service.service';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-layout',
  imports: [CommonModule, FormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  groupId: string | null = null;
  userinput: string = ''
  user: string = ''
  timer: number = 20;
  rounds: number = 2;
  wordCount: number = 3;
  createRoomBody: any = {};
  token = uuidv4(); // e.g., 'a1b2c3...'
  createRoom() {
    this.groupId = crypto.randomUUID(); // Generates a random GUID
  }
  constructor(private toastr: ToastrService, private serviceSrv: ServiceService, private route: Router) {
    console.log(this.token);

  }
  copygroupId() {
    if (this.groupId) {
      navigator.clipboard.writeText(this.groupId);
      this.toastr.success("Room ID copied to clipboard!", "Success")
    }
  }

  PostApiCreateRoom() { 
    this.user = this.user.trim();
    this.userinput = this.userinput.trim();
     console.log(this.user);
    console.log(this.userinput);
    if (this.user == "") {
      this.toastr.error("Please enter your name", "Error")
      return;
    }
    this.serviceSrv.MapToken({
      token: this.token,
      username: this.user
    }).subscribe({
      next: (res: any) => {
        console.log(res);
        
        this.createRoomBody.timer = this.timer;
        this.createRoomBody.rounds = this.rounds;
        this.createRoomBody.WordCount = this.wordCount;
        this.createRoomBody.RoomName = this.groupId;
        this.createRoomBody.CreatedBy = this.user;
        console.log(this.createRoomBody);

        this.serviceSrv.postCreateGroup(this.createRoomBody).subscribe({
          next: (res: any) => {
            console.log(res);
            this.route.navigate(['/home'], { queryParams: { groupId: this.groupId, token: this.token } });
                        
          },
          error: (err: any) => {
            console.error('Error creating group:', err);
            this.toastr.error("Something went wrong. Please try again.", 'Error');
            // You can also add additional error handling logic here, like displaying a message to the user
          }
        });
      },
      error: (err: any) => {
        console.log(err);
      }

    }) 


  }
  GetJoinGroup() {     
    this.user = this.user.trim();
    this.userinput = this.userinput.trim();
    console.log(this.user);
    console.log(this.userinput);
    
    if (this.user == "") {
      this.toastr.error("Name can't be Empty")
      return;
    }
    this.serviceSrv.MapToken({
      token: this.token,
      username: this.user
    }).subscribe({
      next:(res:any)=>{
        this.serviceSrv.getGroup(this.userinput).subscribe({
      next: (res: any) => {
        console.log(res);
        console.log(Object.keys(res).length);

        if (Object.keys(res).length === 0) {
          this.toastr.error("Group not found", "Error");
        } else {
          // this.toastr.success("Group Joined", "Success");
          this.route.navigate(['/home'], { queryParams: { groupId: this.userinput, token: this.token } });
        }
      },
      error: (err: any) => {
        console.error('Error retrieving group:', err);
        this.toastr.error("Something went wrong. Please try again.", 'https://hepefek442.bsite.net/');
      }
    });
      },
      error: (err: any) =>{
        console.log(err);
        
      }
    })
    

  }

}
