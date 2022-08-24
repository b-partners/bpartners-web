import {usersApi} from './api';
import {HaDataProviderType} from './ha-data-provider-type';
import axios from 'axios';
import {getUrlInformation} from "../operations/utils/getUrlInformation";

const profileProvider: HaDataProviderType = {
    async getOne(id: string) {
        const apiUrl: string = process.env.REACT_APP_API_URL || '';
        try{
            const bearerToken = await axios.post(`${apiUrl}/token`,
                { code: getUrlInformation() });
            const userInformation = await axios.get(`${apiUrl}/whoami`, {
                headers: {
                    'Authorization': `Bearer ${bearerToken.data.idToken}`,
                }
            })
            return userInformation.data.user;
        }catch{
            throw new Error("Bad url");
        }
    },
    getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
        throw new Error('Function not implemented.');
    },
    saveOrUpdate: function (resources: any[]): Promise<any[]> {
        throw new Error('Function not implemented.');
    },
};

export default profileProvider;
