import { AnnotationInfo, AnnotationsInfo, NumberAsString, PolygonsForm } from '@/operations/annotator';
import { Polygon } from '@bpartners/annotator-component';
import { Account, AccountHolder, Point, User, Whoami } from '@bpartners/typescript-client';

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
const initialMarkerItem = 'bp_annotations_initial_marker';
const bankReconnectionTime = 'bp_bank_reconnection_time_item';
const apiKeyItem = 'bp_user_api_key';
const roofAnalyseIdItem = 'bp_roof_analyse_id';
const cityJSONRequestIdItem = 'bp_city_json_request_id';
const llmResultItem = 'bp_llm_result_item';
const isRoofPropertiesRequestDoneItem = 'bp_is_roof_properties_request_done_item';
const isAreaPictureImageUpdatedItem = 'bp_is_area_picture_image_updated_item';
const loadingRedirectionItems = 'bp_loading_params_item';
const defaultRoofDelimiterItem = 'bp_default_roof_delimiter_item';
const roofDelimiterLongLatItem = 'bp_roof_delimiter_long_lat_item';
const currentImageSize = 'birdia_image_size';

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

type TInitialMarkerInfo = {
  markerPosition: Point;
  imageSize: number;
};

export const cache = {
  whoami(whoami: Whoami) {
    return cacheObject<Whoami>(whoamiItem, whoami);
  },
  defaultRoofDelimiter(defaultRoofDelimiter: Polygon) {
    return cacheObject<Polygon>(defaultRoofDelimiterItem, defaultRoofDelimiter);
  },
  loadingRedirection(params: string) {
    return localStorage.setItem(loadingRedirectionItems, params);
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
  bankReconnectionTime: (date: string) => {
    localStorage.setItem(bankReconnectionTime, date);
    return date;
  },
  initialMarker(areaPictureId: string, markerPosition: Point, imageSize: number) {
    const data = { markerPosition, imageSize };
    return cacheObject<TInitialMarkerInfo>(`${initialMarkerItem}_${areaPictureId}`, data);
  },
  roofDelimiterLongLatItem(roofDelimiterLongLat: number[][]) {
    localStorage.setItem(roofDelimiterLongLatItem, JSON.stringify(roofDelimiterLongLat));
  },
  apiKey(apiKey: string) {
    localStorage.setItem(apiKeyItem, apiKey);
    return apiKey;
  },
  roofAnalyseId(roofAnalyseId: string) {
    localStorage.setItem(roofAnalyseIdItem, roofAnalyseId);
    return roofAnalyseId;
  },
  cityJSONRequestId(cityJSONRequestId: string) {
    localStorage.setItem(cityJSONRequestIdItem, cityJSONRequestId);
    return cityJSONRequestId;
  },
  llmResult(llmResult: string) {
    localStorage.setItem(llmResultItem, llmResult);
    return llmResult;
  },
  isRoofPropertiesRequestDone(value: boolean) {
    localStorage.setItem(isRoofPropertiesRequestDoneItem, JSON.stringify(value));
    return value;
  },
  isAreaPictureImageUpdated(value: boolean) {
    localStorage.setItem(isAreaPictureImageUpdatedItem, JSON.stringify(value));
    return value;
  },
  currentImageSize(imageSize: number) {
    localStorage.setItem(currentImageSize, JSON.stringify(imageSize));
  },
};

export const getCached = {
  whoami(): Whoami {
    return getCachedObject<Whoami>(whoamiItem);
  },
  defaultRoofDelimiter(): Polygon {
    return getCachedObject<Polygon>(defaultRoofDelimiterItem);
  },
  token() {
    const accessToken = localStorage.getItem(accessTokenItem);
    const refreshToken = localStorage.getItem(refreshTokenItem);
    return { accessToken, refreshToken };
  },
  unapprovedFiles() {
    return +localStorage.getItem(unapprovedFiles);
  },
  roofDelimiterLongLatItem() {
    return JSON.parse(localStorage.getItem(roofDelimiterLongLatItem)) as number[][];
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
  currentImageSize() {
    const imageSizeString = localStorage.getItem(currentImageSize);
    if (!imageSizeString) return null;
    return +imageSizeString;
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
  annotationsInfoList: () => {
    const annotationInfos = getCachedObject<AnnotationsInfo>(annotationsInfoItem);
    if (annotationInfos) {
      return Object.values(annotationInfos) as AnnotationInfo[];
    }
    return [];
  },
  bankReconnectionTime: () => {
    return localStorage.getItem(bankReconnectionTime);
  },
  initialMarker(areaPictureId: string) {
    return getCachedObject<TInitialMarkerInfo>(`${initialMarkerItem}_${areaPictureId}`);
  },
  apiKey() {
    return localStorage.getItem(apiKeyItem);
  },
  roofAnalyseId() {
    return localStorage.getItem(roofAnalyseIdItem);
  },
  cityJSONRequestId() {
    return localStorage.getItem(cityJSONRequestIdItem);
  },
  llmResult() {
    return localStorage.getItem(llmResultItem);
  },
  isRoofPropertiesRequestDone() {
    const value = localStorage.getItem(isRoofPropertiesRequestDoneItem);
    return JSON.parse(value || 'false');
  },
  isAreaPictureImageUpdated() {
    const value = localStorage.getItem(isAreaPictureImageUpdatedItem);
    return JSON.parse(value || 'false');
  },
  loadingRedirection() {
    return localStorage.getItem(loadingRedirectionItems);
  },
};

export const clearCache = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const clearPolygons = (removeRoofAnalyseId = true) => {
  cache.polygons(null);
  cache.annotationsInfo(null);
  localStorage.removeItem(llmResultItem);

  if (removeRoofAnalyseId) {
    localStorage.removeItem(roofAnalyseIdItem);
    localStorage.removeItem(cityJSONRequestIdItem);
  }

  localStorage.removeItem(isAreaPictureImageUpdatedItem);
  localStorage.removeItem(isRoofPropertiesRequestDoneItem);
};

export const clearRoofDelimiter = () => {
  localStorage.removeItem(defaultRoofDelimiterItem);
  localStorage.removeItem(roofDelimiterLongLatItem);
  localStorage.removeItem(currentImageSize);
};
