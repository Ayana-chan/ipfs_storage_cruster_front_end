type NodeStatus = 'Online' | 'Unhealthy' | 'Offline';
type PinStatus = 'Pinned' | 'Pinning' | 'Queued' | 'Failed' | 'NotFound';

interface Node {
  id: string;
  peerId: string;
  rpcAddress: string;
  wrapperPublicAddress?: string;
  wrapperAdminAddress?: string;
  nodeStatus: NodeStatus;
}

interface Pin {
  id: string;
  status: PinStatus;
  cid: string;
}
