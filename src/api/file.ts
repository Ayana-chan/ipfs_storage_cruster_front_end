import httpRequest from '.';

export default class FileApi {
  static download(param: { cid: string; filename: string }) {
    return httpRequest.request<any>({
      url: '/api',
      method: 'GET',
      params: param,
    });
  }
}
