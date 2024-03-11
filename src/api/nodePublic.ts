import { HttpRequest } from '../utils/httpRequest';

const nodePublicHttpRequest = new HttpRequest({
  timeout: import.meta.env.VITE_API_TIME_OUT,
  interceptors: {
    requestInterceptors(config) {
      // console.log('add token to head');
      const token = window.localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    },
  },
});

export default class NodePublicApi {
  static download(targetNodeAddress: string, cid: string, param: { filename: string }) {
    return nodePublicHttpRequest.request<Blob>({
      baseURL: targetNodeAddress,
      url: '/api/' + cid,
      method: 'GET',
      params: param,
      responseType: 'blob',
    });
  }
}
