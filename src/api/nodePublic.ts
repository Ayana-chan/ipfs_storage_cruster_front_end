import { HttpRequest } from '../utils/httpRequest';

const nodePublicHttpRequest = new HttpRequest({
  baseURL: import.meta.env.VITE_API_NODE_PUBLIC,
  timeout: import.meta.env.VITE_API_TIME_OUT,
  interceptors: {
    requestInterceptors(config) {
      // console.log('add token to head');
      const token = 'Bearer ' + window.localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = String(token);
      }
      return config;
    },
  },
});

export default class NodePublicApi {
  static download(cid: string, param: { filename: string }) {
    return nodePublicHttpRequest.request<Blob>({
      url: '/api/' + cid,
      method: 'GET',
      params: param,
      responseType: 'blob',
    });
  }
}
