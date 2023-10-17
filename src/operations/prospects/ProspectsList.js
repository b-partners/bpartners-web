import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {List, useListContext} from 'react-admin';
import {
    Box,
    Grid,
    Tab,
    Tabs,
    TextField,
    Link,
} from '@mui/material';
import {EmptyList} from 'src/common/components/EmptyList';
import ListComponent from 'src/common/components/ListComponent';
import {groupBy} from 'lodash';
import TabPanel from 'src/common/components/TabPanel';
import ProspectsConfiguration from './ProspectsConfiguration';
import {ProspectColumn} from './components';
import {ProspectContextProvider} from 'src/common/store/Prospect-store';
import TabManager from './components/TabManager';

const ProspectsList = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const location = useLocation();

    // Fonction pour mettre à jour l'URL avec le nouvel onglet sélectionné
    const updateURLWithTab = index => {
        const searchParams = new URLSearchParams();
        if (index === 0) {
            searchParams.set('tab', 'prospects');
        } else if (index === 1) {
            searchParams.set('tab', 'configuration');
        }
        const newURL = `${location.pathname}?${searchParams.toString()}`;
        window.history.pushState({}, '', newURL);
    };
    const handleTabChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
        updateURLWithTab(newTabIndex);
    };
    return (
        <ProspectContextProvider>
            <>
                <TabManager location={location} setTabIndex={setTabIndex}/>
                <Box sx={{p: 2}}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label='Mes prospects' component={Link} to='?tab=prospects' data-cy='prospects-tab'/>
                        <Tab label='Configuration' component={Link} to='?tab=configuration'
                             data-cy='configuration-tab'/>
                    </Tabs>

                    <TabPanel value={tabIndex} index={0} sx={{p: 3}}>
                        <List pagination={false} component={ListComponent} actions={false}>
                            <Prospects/>
                        </List>
                    </TabPanel>

                    <TabPanel value={tabIndex} index={1} sx={{p: 3}}>
                        <ProspectsConfiguration/>
                    </TabPanel>
                </Box>
            </>
        </ProspectContextProvider>
    );
};

const Prospects = () => {
    const {data, isLoading, setFilters, filterValues} = useListContext();
    const [prospects, setProspects] = useState();

    useEffect(() => {
        data && setProspects(groupBy(sortProspectsByDate(data), 'status'));
    }, [data]);

    if (isLoading) {
        return null;
    }

    function sortProspectsByDate(data) {
        // Sort the prospects by "lastEvaluation" date from most recent to least recent
        return data.sort((a, b) => {
            const dateA = new Date(a?.rating?.lastEvaluation);
            const dateB = new Date(b?.rating?.lastEvaluation);
            return dateB - dateA;
        });
    }

    return (
        <Box>
            <TextField
                data-testid='prospect-filter'
                defaultValue={filterValues.searchName}
                label='Rechercher un prospect'
                onChange={e => setFilters({searchName: e.target.value}, {searchName: e.target.value}, true)}
            />
            {(data || []).length > 0 ? (
                <>
                    {prospects ? (
                        <Grid container justifyContent='space-between' spacing={2}>
                            <ProspectColumn title='À contacter' list={prospects['TO_CONTACT']} color='#005ce6'/>
                            <ProspectColumn title='Contactés' list={prospects['CONTACTED']} color='#cc0099'/>
                            <ProspectColumn title='Convertis' list={prospects['CONVERTED']} color='#00cc33'/>
                        </Grid>
                    ) : (
                        <EmptyList content='Les données sont en cours de chargement, veuillez patienter.'/>
                    )}
                </>
            ) : (
                <EmptyList/>
            )}
        </Box>
    );
};

export default ProspectsList;
