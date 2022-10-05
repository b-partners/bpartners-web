import { BpDataProviderType } from './bp-data-provider-type'
import { FileApi } from './api'
import { v4 } from 'uuid'

export const fileProvider: BpDataProviderType = {
  async getOne(id: string) {
    return FileApi()
      .getFileById(id)
      .then(({ data }) => data)
  },
  getList: function(page: number, perPage: number, filter: any): Promise<any[]> {
    throw new Error('Function not implemented.')
  },
  async saveOrUpdate(resources: any): Promise<any[]> {
    return FileApi()
      .uploadFile(resources, v4())
      .then(data => [data])
  }
}
