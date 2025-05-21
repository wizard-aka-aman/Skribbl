import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgWhiteboardComponent, WhiteboardElement, WhiteboardOptions } from 'ng-whiteboard';

import { NgWhiteboardService } from 'ng-whiteboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';
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
  lastLength: number = 0;

  @ViewChild(NgWhiteboardComponent) whiteboard!: NgWhiteboardComponent;
  constructor(private router: ActivatedRoute, private whiteboardService: NgWhiteboardService, private serviceSrv: ServiceService) {

    this.router.queryParams.subscribe(param => {
      this.groupId = (param['groupId']);
      this.user = (param['user']);
      console.log(this.groupId);
      this.naam = this.groupId
    })
    console.log(this.user);
    console.log(this.groupId);

  }
  ngOnInit(): void {
    this.serviceSrv.startConnection(
      this.groupId,
      (groupId, data) => {
        // Canvas updates
        const current = this.whiteboard.data || [];
        this.whiteboard.data = [...current, ...data];
      },
      (user: string, message: string, sentAt: string) => {
        // Real-time chat
        this.chats.push({ sender: user, message, sentAt });
      }
    ).then(() => {
      // Fetch previous messages
      this.serviceSrv.getMessages(this.groupId).subscribe((msgs: any) => {
        this.chats = msgs;
      });
    });


  }


  onDataChange(data: WhiteboardElement[]) {
    this.data = data  
    localStorage.setItem('whiteboardData', JSON.stringify(data));
  } 

  clearBoard() {
    this.whiteboardService.clear();
  }
  Undo() {
    this.whiteboardService.undo();
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
  }



}

