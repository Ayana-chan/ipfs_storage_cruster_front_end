import httpRequest from '.';

export default class FileApi {
  static download(cid: string, param: { filename: string }) {
    return httpRequest.request<any>({
      url: '/api/' + cid,
      method: 'GET',
      params: param,
    });
  }
}
