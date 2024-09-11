import { ProspectEvaluationJobInfo } from '@bpartners/typescript-client';
import { Dispatch, ReactNode } from 'react';

export interface RaProspectContext {
  children?: ReactNode;
  loading: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
  handleLoading: (isLoading: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: Dispatch<React.SetStateAction<string>>;
  evaluatedProspectsList: ProspectEvaluationJobInfo[];
  getProspectingJobs: () => Promise<void>;
  refreshLoading: boolean;
  isOpenPopup: boolean;
  prospectJobDetails: ProspectEvaluationJobInfo;
  toggleJobDetailsPopup: (item: ProspectEvaluationJobInfo) => void;
}

interface BankDisconnectionState {
  isInDisconnection: boolean;
}
interface BankDisconnectionAction {
  setIsInDisconnection: (value: boolean) => void;
}

export type TBankDisconnectionStore = BankDisconnectionState & BankDisconnectionAction;

interface ProspectSearchState {
  searchName: string;
}
interface ProspectSearchAction {
  setSearchName: (value: string) => void;
}

export type TProspectSearchStore = ProspectSearchAction & ProspectSearchState;
