export interface UrlInformation {
    code: string;
    scope: string;
    state: string;
}

export function getUrlInformation(): UrlInformation {
    const url = window.location.href;
    const index: number[] = [
        url.indexOf('/?code='),
        url.indexOf('&scope='),
        url.indexOf('&state='),
    ]

    if (!index.includes(-1)) {
        return {
            code: url.slice(index[0] + '/?code='.length, index[1]),
            scope: url.slice(index[1] + '&scope='.length, index[2]),
            state: url.slice(index[2] + '&state='.length, url.length),
        }
    }
    throw new Error("bad url");
}