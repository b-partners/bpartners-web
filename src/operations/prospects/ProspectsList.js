import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {List, useNotify} from 'react-admin';
import {FormProvider, useForm} from 'react-hook-form';
import {Box, Tab, Tabs, Link} from '@mui/material';
import ListComponent from 'src/common/components/ListComponent';
import TabPanel from 'src/common/components/TabPanel';
import ProspectsConfiguration from './ProspectsConfiguration';
import {ProspectDialog, Prospects} from './components';
import {ProspectContextProvider} from 'src/common/store/prospect-store';
import TabManager from './components/TabManager';
import ProspectsAdministration from './ProspectsAdministration';
import {handleSubmit} from "../../common/utils";
import {prospectInfoResolver} from "../../common/resolvers/prospect-info-validator";

const ProspectsList = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [isCreating, setIsCreating] = useState(false);
    const location = useLocation();
    const notify = useNotify();
    const BP_USER = JSON.parse(localStorage.getItem('bp_user'));

    // Fonction pour mettre à jour l'URL avec le nouvel onglet sélectionné
    const updateURLWithTab = index => {
        const searchParams = new URLSearchParams();
        if (index === 0) {
            searchParams.set('tab', 'prospects');
        } else if (index === 1) {
            searchParams.set('tab', 'configuration');
        } else if (index === 2) {
            searchParams.set('tab', 'administration');
        }
        const newURL = `${location.pathname}?${searchParams.toString()}`;
        window.history.pushState({}, '', newURL);
    };
    const handleTabChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
        updateURLWithTab(newTabIndex);
    };

    const toggleDialog = (e) => {
        e?.stopPropagation();
        setIsCreating(!isCreating);
    };

    const form = useForm({mode: 'all', defaultValues: {status: 'TO_CONTACT'}, resolver: prospectInfoResolver});


    const saveOrUpdateProspectSubmit = form.handleSubmit(data => {
        console.log(data);
    });

    useEffect(() => {
        console.log(form.formState.errors);
    }, [form.formState.errors])

    return (
        <ProspectContextProvider>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(saveOrUpdateProspectSubmit)}
                      style={{display: 'flex', flexDirection: 'column'}}>
                    <TabManager location={location} setTabIndex={setTabIndex}/>
                    <Box sx={{p: 2}}>
                        <Tabs value={tabIndex} onChange={handleTabChange}>
                            <Tab label='Mes prospects' component={Link} to='?tab=prospects' data-cy='prospects-tab'/>
                            <Tab label='Configuration' component={Link} to='?tab=configuration'
                                 data-cy='configuration-tab'/>
                            {BP_USER?.roles[0] === 'EVAL_PROSPECT' &&
                                <Tab label='Administration' component={Link} to='?tab=administration'
                                     data-cy='administration-tab'/>}
                        </Tabs>

                        <TabPanel value={tabIndex} index={0} sx={{p: 3}}>
                            <List
                                pagination={false}
                                component={ListComponent}
                                actions={false}
                            >
                                <Prospects toggleDialog={toggleDialog}/>
                            </List>
                        </TabPanel>

                        <TabPanel value={tabIndex} index={1} sx={{p: 3}}>
                            <ProspectsConfiguration/>
                        </TabPanel>

                        {BP_USER?.roles[0] === 'EVAL_PROSPECT' && (
                            <TabPanel value={tabIndex} index={2} sx={{p: 3}}>
                                <ProspectsAdministration/>
                            </TabPanel>
                        )}
                    </Box>
                    {isCreating && <ProspectDialog
                        open={isCreating}
                        close={toggleDialog}
                        saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
                        isCreating={isCreating}
                    />}
                </form>
            </FormProvider>
        </ProspectContextProvider>
    );
};

export default ProspectsList;
