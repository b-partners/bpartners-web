export function getUrlInformation(): string {
    const {search} = location;
    const queryParams = new URLSearchParams(search)
    return queryParams.get("code") || '';
}