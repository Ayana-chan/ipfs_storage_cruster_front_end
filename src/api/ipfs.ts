import type { StandardResponse } from '@/utils/httpRequest';
import httpRequest from '.';

export default class IpfsApi {
  static list_ipfs_nodes() {
    return httpRequest.request<
      StandardResponse<{
        list: IpfsNode[];
      }>
    >({
      url: '/api/admin/ipfs',
      method: 'GET',
    });
  }
}
