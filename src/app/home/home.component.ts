import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgWhiteboardComponent, WhiteboardElement, WhiteboardOptions } from 'ng-whiteboard';

import { NgWhiteboardService } from 'ng-whiteboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  imports: [NgWhiteboardComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  whiteboardOptions: WhiteboardOptions = {
    backgroundColor: 'rgb(224, 224, 224)',
    strokeColor: '#000',
    strokeWidth: 2,
    canvasHeight: 500,
    canvasWidth: 600
  };
  data: any;
  groupId: string = '';
  user: string = '';
  messages: any[] = [];
  message = '';
  naam: any;
  chats: any[] = []; 
  activeUsers: any = [];
  randomWords: string[] = [
    "apple", "car", "tree", "chair", "phone", "dog", "cat", "house", "lamp", "bicycle",
    "pen", "book", "window", "table", "shoe", "clock", "mirror", "television", "refrigerator", "laptop",
    "cup", "hat", "bag", "bus", "train", "fan", "door", "sofa", "bed", "toothbrush",
    "bottle", "ball", "plate", "knife", "fork", "spoon", "sink", "oven", "microwave", "towel",
    "carpet", "blanket", "pillow", "wallet", "watch", "glasses", "helmet", "jacket", "key", "notebook",
    "printer", "mouse", "keyboard", "calendar", "plant", "flower", "bridge", "mountain", "river", "cloud",
    "sun", "moon", "star", "airplane", "boat", "motorcycle", "truck", "garage", "building", "fence",
    "road", "sidewalk", "bench", "statue", "painting", "camera", "ticket", "umbrella", "glove", "scarf",
    "stove", "pan", "cupboard", "bucket", "mop", "broom", "vacuum", "remote", "speaker", "projector",
    "mailbox", "fountain", "elevator", "stairs", "handrail", "curtain", "chalkboard", "whiteboard", "marker", "highlighter"
  ] 
  activeUsersChanges: any = {};
  isStarted: boolean = false
  whoDraw : string = ""
  
  
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(NgWhiteboardComponent) whiteboard!: NgWhiteboardComponent;
  constructor(private router: ActivatedRoute, private toastr: ToastrService, private whiteboardService: NgWhiteboardService, private serviceSrv: ServiceService) {

    this.router.queryParams.subscribe(param => {
      this.groupId = (param['groupId']);
      this.user = (param['user']);
      console.log(this.groupId);
      this.naam = this.groupId
    })
    console.log(this.user);
    console.log(this.groupId);

  }
  async ngOnInit(): Promise<void> {
    await this.serviceSrv.startConnection(
      this.groupId,
      this.user,
      (groupId, data) => {

        const current = this.whiteboard.data || [];
        this.whiteboard.data = [...current, ...data];
      },
      (user: string, message: string, sentAt: string) => {
        this.chats.push({ sender: user, message, sentAt });
        setTimeout(() => {
          const el = this.chatContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }, 10);
      },
      (users: string[]) => {
        this.activeUsers = users;
        console.log("Active users updated:", users);
      }
    );

    try {
      this.activeUsers = await this.serviceSrv.GetUsersInGroup(this.groupId);
      console.log(this.activeUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }

    this.serviceSrv.getMessages(this.groupId).subscribe((msgs: any) => {
      this.chats = msgs;
    });
    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 250);
  }



  onDataChange(data: WhiteboardElement[]) {
    this.data = data; 
    console.log(this.data);
    
     
    // this.send();
    // localStorage.setItem('whiteboardData', JSON.stringify(data));
  } 

  clearBoard() {
   this.data = this.whiteboardService.clear();  
   setTimeout(() => {
      
    this.send()
  }, 100);
}
Undo() {
  this.whiteboardService.undo(); 
  setTimeout(() => {
    this.send() 
    }, 100);
  }

  send() {
    this.serviceSrv.SendCanvas(this.groupId, this.data);
  }

  sendchat() {
    const sentAt = new Date().toLocaleString();
    if (this.message.trim()) {
      this.serviceSrv.sendMessage(this.groupId, this.user, this.message, sentAt);
      this.message = '';
    }
    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 50);
  }
  start() {
    console.log(this.activeUsers);
    console.log((Math.random() * 100).toFixed(0));
    console.log(this.randomWords[Number.parseInt((Math.random() * 100).toFixed(0))]);
    if (this.activeUsers.length < 2) {
      this.toastr.warning("Cannot start a room with less than 2 Users !", "Warning")
      return;
    }
    this.toastr.success("Room Started Successfully !", "Success");
    this.isStarted = true;
    this.  activeUsersChanges = this.activeUsers.map((e:any)=> ({
      user : e,
      isDrawing : false ,
      counter : 2
    } ))
    console.log(this.activeUsersChanges);
    
    for (let index = 0; index < this.activeUsersChanges.length; index++) {
      const element = this.activeUsersChanges[index];
          element.isDrawing = true;
          this.whoDraw = element.user;
          
          
          
    }

  }



}

