import {usersApi} from './api';
import {HaDataProviderType} from './ha-data-provider-type';
import axios from 'axios';
import {getUrlInformation} from "../operations/utils/getUrlInforamtion";

const profileProvider: HaDataProviderType = {
    async getOne(id: string) {
        try{
            const bearerToken = await axios.post("http://localhost:8080/token", { code: getUrlInformation().code })
            return await axios.get("http://localhost:8080/whoami", {
                headers: {
                    'Authorization': 'Bearer ' + bearerToken.data.idToken
                }
            })
        }catch{
            throw new Error("Bad url");
        }
            
        // const role = 'MANAGER';
        // if (role === 'MANAGER') {
        //   return usersApi()
        //     .getManagerById(id)
        //     .then(result => result.data);
        // }
    },
    getList: function (page: number, perPage: number, filter: any): Promise<any[]> {
        throw new Error('Function not implemented.');
    },
    saveOrUpdate: function (resources: any[]): Promise<any[]> {
        throw new Error('Function not implemented.');
    },
};

export default profileProvider;
