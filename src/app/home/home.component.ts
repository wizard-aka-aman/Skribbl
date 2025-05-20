import { Component, OnInit } from '@angular/core';
import { NgWhiteboardComponent, WhiteboardElement, WhiteboardOptions } from 'ng-whiteboard';

import { NgWhiteboardService } from 'ng-whiteboard';
@Component({
  selector: 'app-home',
  imports: [NgWhiteboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

   whiteboardOptions: WhiteboardOptions = {
    backgroundColor: '#fff',
    strokeColor: '#000',
    strokeWidth: 2,
    canvasHeight : 500,
    canvasWidth : 600
  };
  data: any;

  constructor(private whiteboardService: NgWhiteboardService) {}

  ngOnInit() {
    const savedData = localStorage.getItem('whiteboardData'); 
    
    if (savedData) {
      this.data = JSON.parse(savedData);
      console.log(this.data);
    }
  }

  onDataChange(data: WhiteboardElement[]) {
    localStorage.setItem('whiteboardData', JSON.stringify(data));
  }

  clearBoard() {
    this.whiteboardService.clear();
  }
}

