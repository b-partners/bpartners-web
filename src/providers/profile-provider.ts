import {usersApi} from './api';
import {HaDataProviderType} from './ha-data-provider-type';
import axios from 'axios';
import getParams from 'src/operations/utils/getParams';

const profileProvider: HaDataProviderType = {
    async getOne(id: string) {
        const apiUrl: string = process.env.REACT_APP_API_URL || '';
        try{
            const {search} = document.location;
            const params = {
                code: getParams(search, "code") || "",
                successUrl: "http://localhost:3000",
                failureUrl: "http://localhost:3000/error",
            }
            const bearerToken = await axios.post(`${apiUrl}/token`,params);
            
            const userInformation = await axios.get(`${apiUrl}/whoami`, {
                headers: {
                    'Authorization': `Bearer ${bearerToken.data.refreshToken}`,
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
