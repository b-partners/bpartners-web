import { CalendarEvent } from 'bpartners-react-client';
import { calendarApi } from '../api';
import { getCached } from '../cache';
import { calendarEventMapper } from '../mappers';

export class CalendarSync {
  private localCalendarEvent: CalendarEvent[];
  private googleCalendarEvent: CalendarEvent[];
  private newLocalCalendarEvent: CalendarEvent[] = [];
  private calendarId: string;
  private userId: string;
  private start_gte: Date;
  private start_lte: Date;

  constructor(calendarId: string, start_gte: Date, start_lte: Date) {
    const { userId } = getCached.userInfo();
    this.calendarId = calendarId;
    this.start_gte = start_gte;
    this.start_lte = start_lte;
    this.userId = userId;
  }

  private async getAll() {
    const [local, google] = await Promise.all([
      (await calendarApi().getCalendarEvents(this.userId, this.calendarId, 'LOCAL', this.start_gte, this.start_lte)).data,
      (await calendarApi().getCalendarEvents(this.userId, this.calendarId, 'GOOGLE_CALENDAR', this.start_gte, this.start_lte)).data,
    ]);
    this.localCalendarEvent = local;
    this.googleCalendarEvent = google;
  }

  private async filter() {
    await this.getAll();
    const [local, google] = [[...this.localCalendarEvent], [...this.googleCalendarEvent]];
    const news: CalendarEvent[] = [];
    local.map(localEvent => {
      const indexOfCopyInGoggle = google.findIndex(eventInGoogle => eventInGoogle.id === localEvent.id);

      if (indexOfCopyInGoggle === -1) {
        news.push(google[indexOfCopyInGoggle]);
        google.splice(indexOfCopyInGoggle, 1);
        return google[indexOfCopyInGoggle];
      } else {
        const res = calendarEventMapper.toDomain(localEvent, google[indexOfCopyInGoggle]);
        this.newLocalCalendarEvent.push(res);
        return res;
      }
    });
    return [...news, ...google];
  }

  private async saveNewFromBoth() {
    const newFromBoth = await this.filter();
    const { data } = await calendarApi().crupdateCalendarEvents(this.userId, this.calendarId, newFromBoth);
    return data;
  }

  public async syncCalendar() {
    this.saveNewFromBoth();
  }

  public getNewCalendarEvent() {
    return this.newLocalCalendarEvent;
  }
}
