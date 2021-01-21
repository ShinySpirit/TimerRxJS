import { Component, OnInit } from '@angular/core';
import {Observable, interval, timer, Subscription, Subject, NEVER} from 'rxjs';
import { MergeMapSubscriber } from 'rxjs/internal/operators/mergeMap';
import { SubjectSubscriber } from 'rxjs/internal/Subject';
import {map, mapTo, scan, startWith, switchAll, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TimerRxJS';

  private time: number;
  private timer_string: string;
 
  pause_click_time: number;
  pause_allow: boolean;

  private counterSubject:Subject<{pause?: boolean, conuterValue?: number}> = new Subject();

  private initCounter() {

    this.counterSubject.pipe(
      startWith({pause: true, conuterValue: 0}),
      scan((acc, val) => ({...acc, ...val})),
      tap((state) => {
        this.time = state.conuterValue;
        this.convert_time();

      }),
      switchMap((state) => state.pause ? NEVER : interval(10) .pipe(
        tap(val => {
          state.conuterValue += 1;
          this.time = state.conuterValue;
          
          this.convert_time();

          if(this.pause_allow && this.time - this.pause_click_time >= 30) {
            this.pause_allow = false;
          }
          
        })
      ))
    ).subscribe();
 
  }

  convert_time(){

    const hr = Math.floor(this.time / 360000);
    const min = Math.floor(this.time % 360000 / 6000); 
    const sec = Math.floor(this.time % 6000 / 100);
    const msec = this.time % 100; 

    this.timer_string = (hr < 10 ? '0' + hr.toString() : hr.toString()) + ':' + (min < 10 ? '0' + min.toString() : min.toString()) + ':' + 
    (sec < 10 ? '0' + sec.toString() : sec.toString()) + ':' + (msec < 10 ? '0' + msec.toString() : msec.toString());
  }
  
  ngOnInit(){

    this.time = 0;
    this.timer_string = '';
    this.pause_allow = false;

    this.initCounter();
  }

  startCounter() {

    this.counterSubject.next({pause: false});    
  }

  pauseCounter() {

    if(this.pause_allow) {
      if(this.time - this.pause_click_time < 30) {

        this.counterSubject.next({pause: true});
      }
      else {
        this.pause_allow = !this.pause_allow;
      }
    }
    else {
      this.pause_allow = true;
      this.pause_click_time = this.time;
    }

    
  }

  resetCounter() {

    this.counterSubject.next({pause: true, conuterValue: 0});
  }

}
