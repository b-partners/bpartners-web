import { InvoiceRelaunch } from "src/gen/bpClient";
import { singleAccountGetter } from "./account-provider";
import { payingApi } from "./api";
import authProvider from "./auth-provider";

const getUserInfo = async (): Promise<{ accountId: string; userId: string }> => {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;
    return { userId, accountId };
};

const relaunchProvider = {
    async getConf() {
        const { accountId } = await getUserInfo();
        return payingApi()
        .getInvoiceRelaunch(accountId)
        .then(({ data }) => data);
    },
    updateConf: async function (resources: InvoiceRelaunch): Promise<InvoiceRelaunch> {
        const { accountId } = await getUserInfo();
        return payingApi()
        .relaunchInvoice(resources, accountId)
        .then(({ data }) => data);
    },
};

export default relaunchProvider;