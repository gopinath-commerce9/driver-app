import { Injectable } from '@angular/core';
import { Observable, from, of, throwError, Subject } from 'rxjs';
import { filter, catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GlobalEventsService {

  private generalEvent = new Subject<any>();
  private pageEvent = new Subject<any>();
  private menuPageEvent = new Subject<any>();

  publishEvent(data: any) {
    this.generalEvent.next(data);
  }

  getEventPublisher(): Subject<any> {
    return this.generalEvent;
  }

  gotoPage(data: any) {
    this.pageEvent.next(data);
  }

  getPagePublisher(): Subject<any> {
    return this.pageEvent;
  }

  gotoMenuPage(data: any) {
    this.menuPageEvent.next(data);
  }

  getMenuPagePublisher(): Subject<any> {
    return this.menuPageEvent;
  }

}
