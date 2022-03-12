import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
})
export class CircleProgressComponent implements OnInit {

  @Input() progressAmount: number = 0;

  constructor() {

  }

  ngOnInit() {
  }
}
