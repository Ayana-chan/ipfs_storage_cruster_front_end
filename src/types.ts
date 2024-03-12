type IpfsNodeStatus = 'Online' | 'Unhealthy' | 'Offline';

interface IpfsNode {
  peerId: string;
  rpcAddress: string;
  wrapperPublicAddress: string;
  wrapperAdminAddress: string;
  status: IpfsNodeStatus;
}
