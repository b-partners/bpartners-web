import { AnnotationInfo, AnnotationsInfo, NumberAsString, PolygonsForm } from '@/operations/annotator';
import { Polygon } from '@bpartners/annotator-component';
import { Account, AccountHolder, User, Whoami } from '@bpartners/typescript-client';

const whoamiItem = 'bp_whoami';
const accessTokenItem = 'bp_access_token';
const refreshTokenItem = 'bp_refresh_token';
const unapprovedFiles = 'bp_unapproved_Files';
const accountItem = 'bp_account';
const accountHolderItem = 'bp_accountHolder';
const userItem = 'bp_user';
const invoiceConfirmedListSwitchItem = 'bp_invoiceConfirmedListSwitch';
const timeZoneItem = 'bp_time_zone';
const calendarSyncItem = 'bp_calendar_sync_item';
const polygonsItem = 'bp_polygons_item';
const annotationsInfoItem = 'bp_annotations_info_item';

const cacheObject = <T>(key: string, value: T) => {
  const valueAsString = JSON.stringify({ ...value });
  if (!valueAsString || valueAsString.length < 10) {
    localStorage.setItem(key, null);
    return value;
  }
  localStorage.setItem(key, valueAsString);
  return { ...value };
};

const getCachedObject = <T>(key: string): T => {
  const valueAsString = localStorage.getItem(key);
  if (!valueAsString || valueAsString.length < 4) return null;
  return JSON.parse(valueAsString);
};

export const cache = {
  whoami(whoami: Whoami) {
    return cacheObject<Whoami>(whoamiItem, whoami);
  },
  token(accessToken: string, refreshToken: string) {
    localStorage.setItem(accessTokenItem, accessToken);
    localStorage.setItem(refreshTokenItem, refreshToken);
  },
  unapprovedFiles(onlyNotApprovedLegalFiles: number) {
    localStorage.setItem(unapprovedFiles, onlyNotApprovedLegalFiles.toString());
  },
  account(account: Account) {
    return cacheObject<Account>(accountItem, account);
  },
  user(user: User) {
    return cacheObject<User>(userItem, user);
  },
  accountHolder(accountHolder: AccountHolder) {
    return cacheObject<AccountHolder>(accountHolderItem, accountHolder);
  },
  invoiceConfirmedListSwitch(value: boolean) {
    return localStorage.setItem(invoiceConfirmedListSwitchItem, value ? '1' : '0');
  },
  timeZone: (timeZone: string) => {
    return localStorage.setItem(timeZoneItem, timeZone);
  },
  calendarSync: (value: boolean = false) => {
    return localStorage.setItem(calendarSyncItem, JSON.stringify(value));
  },
  polygons: (polygons: Polygon[]) => {
    return cacheObject(polygonsItem, polygons);
  },
  annotationsInfo: (info: AnnotationInfo[]) => {
    return cacheObject(annotationsInfoItem, info);
  },
};

export const getCached = {
  whoami(): Whoami {
    return getCachedObject<Whoami>(whoamiItem);
  },
  token() {
    const accessToken = localStorage.getItem(accessTokenItem);
    const refreshToken = localStorage.getItem(refreshTokenItem);
    return { accessToken, refreshToken };
  },
  unapprovedFiles() {
    return +localStorage.getItem(unapprovedFiles);
  },
  account() {
    return getCachedObject<Account>(accountItem);
  },
  accountHolder() {
    return getCachedObject<AccountHolder>(accountHolderItem);
  },
  user() {
    return getCachedObject<User>(userItem);
  },
  userInfo() {
    const { id: accountId } = this.account() || { id: null };
    const { id: accountHolderId } = this.accountHolder() || { id: null };
    const { id: userId } = this.whoami()?.user || { id: null };
    return { accountId, accountHolderId, userId };
  },
  invoiceConfirmedListSwitch() {
    return localStorage.getItem(invoiceConfirmedListSwitchItem) === '1';
  },
  timeZone() {
    return localStorage.getItem(timeZoneItem) || 'Europe/Paris';
  },
  calendarSync(): boolean {
    return JSON.parse(localStorage.getItem(calendarSyncItem)) || false;
  },
  polygons: () => {
    const polygons = getCachedObject<PolygonsForm>(polygonsItem);
    if (!polygons) return null;
    const polygonsArray: Polygon[] = [];
    Object.keys(polygons).forEach(index => polygonsArray.push(polygons[index as NumberAsString]));
    return polygonsArray;
  },
  annotationsInfo: () => {
    return getCachedObject<AnnotationsInfo>(annotationsInfoItem);
  },
};

export const clearCache = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const clearPolygons = () => {
  cache.polygons(null);
  cache.annotationsInfo(null);
};
