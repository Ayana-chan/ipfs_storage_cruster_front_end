import { HttpRequest } from '../utils/httpRequest';

const nodeAdminHttpRequest = new HttpRequest({
  baseURL: import.meta.env.VITE_API_NODE_ADMIN,
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

export default class NodeAdminApi {
  static pin_add(data: { cid: string; filename?: string }) {
    return nodeAdminHttpRequest.request<any>({
      baseURL: 'http://127.0.0.1:4000',
      timeout: 100000,
      url: '/api/pin/add',
      method: 'POST',
      data,
    });
  }
}
