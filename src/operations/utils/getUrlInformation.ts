export interface UrlInformation {
    code: string;
    scope: string;
    state: string;
}

export function getUrlInformation(): string {
    const {search} = location;
    const queryParams = new URLSearchParams(search)
    return queryParams.get("code") || '';
}