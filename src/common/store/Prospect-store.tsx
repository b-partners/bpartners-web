import React, { Dispatch, FC, createContext, useContext, useState } from 'react';

export type DialogType = 'EDIT' | 'CHANGE_STATUS';

type Modal = {
    type: DialogType;
    isOpen: boolean;
};

type RaProspectContext = {
    modal: Modal,
    openModal: (type: DialogType) => void;
    closeModal: () => void;
    loading: boolean;
    handleLoading: (isLoading: boolean) => void;
    selectedStatus: string;
    setSelectedStatus: Dispatch<React.SetStateAction<string>>;
};

const ProspectContext = createContext<RaProspectContext>({
    modal: {
        type: 'EDIT',
        isOpen: false,
    },
    openModal: () => {},
    closeModal: () => {},
    loading: false,
    handleLoading: () => {},
    selectedStatus: '',
    setSelectedStatus: () => {},
});

export const useProspectContext = () => useContext(ProspectContext);

export const ProspectContextProvider: FC = ({ children }) => {
    const [modal, setModal] = useState<Modal>({
        type: 'EDIT',
        isOpen: false,
    });
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    const handleLoading = (isLoading: boolean) => {
        setLoading(isLoading);
    };

    const closeModal = () => {
        setModal({
            ...modal,
            isOpen: false,
        });
    };

    const openModal = (type: DialogType) => {
        setModal({
            type: type,
            isOpen: true,
        });
    };

    return (
        <ProspectContext.Provider
            value={{
                modal,
                openModal,
                closeModal,
                loading,
                handleLoading,
                selectedStatus,
                setSelectedStatus,
            }}
        >
            {children}
        </ProspectContext.Provider>
    );
};