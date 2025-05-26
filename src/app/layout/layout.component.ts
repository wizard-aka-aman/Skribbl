import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {   Router, RouterLink } from '@angular/router';
import { HttpClient } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule , RouterLink , FormsModule  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent { 
  groupId: string | null = null;
  userinput :string = ''
  user :string = ''
  timer : number = 0;
  rounds : number = 0;
  wordCount : number = 0;
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
    //[routerLink]="['/home']"[queryParams]="{groupId : groupId , user : user}
    this.createRoomBody.timer = this.timer;
    this.createRoomBody.rounds = this.rounds;
    this.createRoomBody.WordCount = this.wordCount;
    this.createRoomBody.RoomName = this.groupId;
    this.createRoomBody.CreatedBy = this.user;
    console.log(this.createRoomBody);

      this.serviceSrv.postCreateGroup(this.createRoomBody).subscribe((res:any)=>{
        console.log(res);
        this.route.navigate(['/home'], { queryParams: {  groupId: this.groupId, user: this.user } });
      }) 
  }
  GetJoinGroup(){
    this.serviceSrv.getGroup(this.userinput).subscribe((res:any)=>{
      console.log(res);
      
      console.log(Object.keys(res).length); 
      if(Object.keys(res).length == 0){
        this.toastr.error("Group not found" ,"Error")
      }
      else{
        this.toastr.success("Group Joined" ,"Success")
         this.route.navigate(['/home'], { queryParams: {  groupId: this.userinput, user: this.user } });
      }
    })
  }

}
