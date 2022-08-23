import fakeDataProvider from 'ra-data-fakerest';

export const mockDataProvider = fakeDataProvider({
    transactions: [
        {
            id: 1,
            "amount": 500,
            "title": "string",
            "paymentReqId": "kjsf8hjkz",
            "updateDateTime": "1900-02-05"
        },
        {
            id: 2,
            "amount": 500,
            "title": "string",
            "paymentReqId": "kjsjsklflksdjff8hjkz",
            "updateDateTime": "1900-02-05"
        },
        {
            id: 3,
            "amount": 500,
            "title": "string",
            "paymentReqId": "Iuerjsdf",
            "updateDateTime": "1900-02-05"
        },
        {
            id: 4,
            "amount": 500,
            "title": "string",
            "paymentReqId": "klsjhfsdjklf",
            "updateDateTime": "1900-02-05"
        },
        {
            id: 5,
            "amount": 200,
            "title": "string",
            "paymentReqId": "jdsfijhznjd",
            "updateDateTime": "2002-10-12"
        }
    ],
    profile: []
}, true)