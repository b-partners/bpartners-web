import { ProspectEvaluationJobInfo } from '@bpartners/typescript-client';
import { Dispatch, FC, createContext, useContext, useState } from 'react';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants/invoice';
import { prospectingJobsProvider } from 'src/providers/prospecting-jobs-provider';

type RaProspectContext = {
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
};

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

  return (
    <ProspectContext.Provider
      value={{
        loading,
        setLoading,
        handleLoading,
        selectedStatus,
        setSelectedStatus,
        evaluatedProspectsList,
        getProspectingJobs,
        refreshLoading,
        //
        isOpenPopup,
        prospectJobDetails,
        toggleJobDetailsPopup,
        //
      }}
    >
      {children}
    </ProspectContext.Provider>
  );
};
