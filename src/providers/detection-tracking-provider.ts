import { DetectionTracking } from '@bpartners/typescript-client';
import { detectionTrackingApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

export const getDetectionTrackingList = async (pageSize: number): Promise<DetectionTracking[]> => {
  const { id } = await asyncGetUser();
  const { data } = await detectionTrackingApi().retrieveDetectionTrackingListByUserId(id, undefined, 1, pageSize);
  return data || [];
};
