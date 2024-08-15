import { AUTOCOMPLETE_LIST_LENGTH } from '@/constants/invoice';
import { prospectingJobsProvider } from '@/providers/prospecting-jobs-provider';
import { ProspectEvaluationJobInfo } from '@bpartners/typescript-client';
import { createContext, FC, useContext, useMemo, useState } from 'react';
import { RaProspectContext } from './types';

const ProspectContext = createContext<RaProspectContext>({
  loading: false,
  setLoading: () => {},
  handleLoading: () => {},
  selectedStatus: '',
  setSelectedStatus: () => {},
  evaluatedProspectsList: [],
  getProspectingJobs: async () => {},
  refreshLoading: false,
  isOpenPopup: false,
  prospectJobDetails: {},
  toggleJobDetailsPopup: () => {},
});

export const useProspectContext = () => useContext(ProspectContext);

export const ProspectContextProvider: FC<RaProspectContext> = ({ children, loading, setLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [evaluatedProspectsList, setEvaluatedProspectsList] = useState<ProspectEvaluationJobInfo[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  //
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [prospectJobDetails, setProspectJobDetails] = useState<ProspectEvaluationJobInfo>({});
  //

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };
  /* get all prospects jobs */
  const getProspectingJobs = async () => {
    setRefreshLoading(true);
    const data = await prospectingJobsProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, {});
    const spreadsheet_evaluation_data = data.filter(item => item.type === 'SPREADSHEET_EVALUATION');
    setEvaluatedProspectsList(spreadsheet_evaluation_data);
    setRefreshLoading(false);
  };
  // show popup with prospect job details
  const toggleJobDetailsPopup = (item: ProspectEvaluationJobInfo) => {
    setProspectJobDetails(item);
    setIsOpenPopup(!isOpenPopup);
  };

  const contextValues = useMemo(
    () => ({
      loading,
      setLoading,
      handleLoading,
      selectedStatus,
      setSelectedStatus,
      evaluatedProspectsList,
      getProspectingJobs,
      refreshLoading,
      isOpenPopup,
      prospectJobDetails,
      toggleJobDetailsPopup,
    }),
    [
      loading,
      setLoading,
      handleLoading,
      selectedStatus,
      setSelectedStatus,
      evaluatedProspectsList,
      getProspectingJobs,
      refreshLoading,
      isOpenPopup,
      prospectJobDetails,
      toggleJobDetailsPopup,
    ]
  );

  return <ProspectContext.Provider value={contextValues}>{children}</ProspectContext.Provider>;
};
