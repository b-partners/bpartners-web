import fakeDataProvider from 'ra-data-fakerest'
import { TRANSACTIONS } from './transactions'

export const mockDataProvider = fakeDataProvider({
  transactions: TRANSACTIONS,
  profile: []
}, true) 