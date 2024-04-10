<script setup lang="ts">
import { fakeDownload } from '@/utils';
import type { AxiosError } from 'axios';
import NodePublicApi from '@/api/nodePublic';
import axios from 'axios';
import IpfsApi from '@/api/ipfs';

onMounted(() => {
  refreshIpfsNodes();
});

const initialIpfsNodes: AddNewIpfsNodeFormType[] = [
  {
    rpcAddress: 'slave-ipfs-0:5001',
    wrapperPublicAddress: '192.168.177.134:3000',
    wrapperAdminAddress: 'wrapper-0:4000',
  },
  {
    rpcAddress: 'slave-ipfs-1:5001',
    wrapperPublicAddress: '192.168.177.134:3000',
    wrapperAdminAddress: 'wrapper-1:4000',
  },
];

const uploadResponse = ref<string | null>(null);
const uploadFile = async (event: Event) => {
  const files = (event?.target as HTMLInputElement)?.files;
  if (!files) return;
  const file = files[0];

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post(
      import.meta.env.VITE_API_MANAGER_ADDR + '/api/file',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    uploadResponse.value = JSON.stringify(res.data, null, 2);
  } catch (error) {
    console.error('Upload failed:', error);
    uploadResponse.value = 'Upload failed';
  }
};

const ipfsNodeList = ref<Node[]>([
  // {
  //   peerId: 'node1',
  //   rpcAddress: 'http://127.100.100.100:5001',
  //   wrapperPublicAddress: 'http://127.100.100.100:3000',
  //   wrapperAdminAddress: 'http://127.100.100.100:4000',
  //   nodeStatus: 'Online',
  // },
]);

const statusStyle = (status: NodeStatus): any => {
  switch (status) {
    case 'Online':
      return { color: 'green' };
    case 'Unhealthy':
      return { color: 'red' };
    case 'Offline':
      return { color: 'grey' };
    default:
      return { color: 'yello' };
  }
};

const refreshIpfsNodes = () => {
  IpfsApi.listIpfsNodes()
    .then((res) => {
      console.log('Succeed refresh nodes');
      ipfsNodeList.value = res.data.data.list;
    })
    .catch((err: AxiosError) => {
      console.error('Failed refresh nodes', err);
      ElMessage.error('Failed refresh nodes');
    });
};

const addNewIpfsNode = () => {
  addNewIpfsNodeCore(addNewIpfsNodeForm);
};

const addNewIpfsNodeCore = (form: AddNewIpfsNodeFormType) => {
  IpfsApi.addIpfsNode(form)
    .then((res) => {
      ElMessage.success('Succeed add node');
      console.log('Succeed add node', addNewIpfsNodeForm);
      // refresh
      refreshIpfsNodes();
    })
    .catch((err: AxiosError) => {
      console.error('Failed add node', err);
      ElMessage.error('Failed add node');
    });
};

const addAllInitialIpfsNodes = () => {
  console.log('Begin add all initial IPFS nodes', initialIpfsNodes);
  Promise.all(
    initialIpfsNodes.map(
      (form) =>
        new Promise<void>((resolve) => {
          addNewIpfsNodeCore(form);
          resolve();
        })
    )
  ).then(() => {
    console.log('Finish add all initial IPFS nodes');
    refreshIpfsNodes();
  });
};

const reBootstrapAll = () => {
  ElMessage.info('Re-bootstrap all node ...');
  console.log('Re-bootstrap all node ...');
  IpfsApi.reBootstrapAllIpfsNode()
    .then((res) => {
      ElMessage.success('Succeed re-bootstrap all node');
      console.log('Succeed re-bootstrap all node');
      // refresh
      refreshIpfsNodes();
    })
    .catch((err: AxiosError) => {
      console.error('Failed re-bootstrap all node', err);
      ElMessage.error('Failed re-bootstrap all node');
    });
};

// QmZigK4HbeA8gLm3vNyA5pEqJeHhyWLX2BGzeS7tttodTX
const downloadFile = (
  targetUrl: string,
  cid: string,
  opt_filename?: string
) => {
  ElMessage.info('Download ' + cid + ' from ' + targetUrl);
  console.log('Download ' + cid + ' from ' + targetUrl);

  let filename: string;
  if (opt_filename) {
    filename = opt_filename;
  } else {
    filename = cid;
  }
  // console.log('Download file name', filename, opt_filename);

  // First, axios download file to memory;
  // Then, save file to local disk by fake link.
  console.log('Download request');
  NodePublicApi.download(targetUrl, cid, { filename })
    .then((res) => {
      console.log('Finish download to memory.', res);
      fakeDownload(filename, [res.data]);
      console.log('Download success');
      ElMessage.success('Download success');
    })
    .catch((err: AxiosError) => {
      console.warn('Download failed, or caught by browser plugin', err);
      ElMessageBox.alert(
        'Download failed, or caught by browser plugin',
        'Warning'
      );
      // ElMessage.warning('Download failed, or caught by browser plugin');
    });
};

interface AddNewIpfsNodeFormType {
  rpcAddress: string;
  wrapperPublicAddress: string;
  wrapperAdminAddress: string;
}
const addNewIpfsNodeDialogVisible = ref(false);
const addNewIpfsNodeForm = reactive<AddNewIpfsNodeFormType>({
  rpcAddress: '',
  wrapperPublicAddress: '',
  wrapperAdminAddress: '',
});
const onAddNewIpfsNodeClick = () => {
  addNewIpfsNode();
  addNewIpfsNodeDialogVisible.value = false;
};

const nodeDownloadDialogVisible = ref(false);
const nodeDownloadForm = reactive({
  nodeAddress: '',
  cid: '',
  filename: '',
});
const onNodeDownloadDialogOpen = (row: Node) => {
  if (!row.wrapperPublicAddress) {
    ElMessage.error("Can't download. Service not available.");
    return;
  }
  nodeDownloadDialogVisible.value = true;
  nodeDownloadForm.nodeAddress = row.wrapperPublicAddress;
};
const onNodeDownloadClick = () => {
  downloadFile(
    nodeDownloadForm.nodeAddress,
    nodeDownloadForm.cid,
    nodeDownloadForm.filename
  );
  nodeDownloadDialogVisible.value = false;
};
</script>

<template>
  <div>
    <input type="file" @change="uploadFile" />
    <div v-if="uploadResponse">{{ uploadResponse }}</div>
  </div>

  <br />

  <el-button type="primary" @click="addNewIpfsNodeDialogVisible = true"
    >Add IPFS node</el-button
  >
  <el-button type="primary" @click="reBootstrapAll"
    >Re-bootstrap all IPFS node</el-button
  >
  <el-button type="primary" @click="addAllInitialIpfsNodes"
    >Quick add all initial IPFS node</el-button
  >

  <!-- Add IPFS node -->
  <el-dialog
    v-model="addNewIpfsNodeDialogVisible"
    title="Download from Node"
    width="500"
    draggable
    overflow
  >
    <el-form :model="addNewIpfsNodeForm">
      <el-form-item label="RPC Address" :label-width="200">
        <el-input v-model="addNewIpfsNodeForm.rpcAddress" />
      </el-form-item>
      <el-form-item label="Wrapper Public Address" :label-width="200">
        <el-input v-model="addNewIpfsNodeForm.wrapperPublicAddress" />
      </el-form-item>
      <el-form-item label="Wrapper Admin Address" :label-width="200">
        <el-input v-model="addNewIpfsNodeForm.wrapperAdminAddress" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="addNewIpfsNodeDialogVisible = false"
          >Cancel</el-button
        >
        <el-button type="primary" @click="onAddNewIpfsNodeClick">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-table :data="ipfsNodeList" style="width: 100%" max-height="250">
    <el-table-column fixed prop="peerId" label="Peer Id" width="200" />
    <el-table-column prop="rpcAddress" label="RPC Address" width="250" />
    <el-table-column
      prop="wrapperPublicAddress"
      label="Wrapper Public Address"
      width="250"
    />
    <el-table-column
      prop="wrapperAdminAddress"
      label="Wrapper Admin Address"
      width="250"
    />
    <el-table-column label="Status">
      <template #default="scope">
        <span :style="statusStyle(scope.row.nodeStatus)">{{
          scope.row.nodeStatus
        }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Operations">
      <template #default="{ row }">
        <el-button
          type="primary"
          size="small"
          @click="onNodeDownloadDialogOpen(row)"
          >Download</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <!-- Download from node -->
  <el-dialog
    v-model="nodeDownloadDialogVisible"
    title="Download from Node"
    width="500"
    draggable
    overflow
  >
    <el-form :model="nodeDownloadForm">
      <el-form-item label="CID" :label-width="80">
        <el-input v-model="nodeDownloadForm.cid" />
      </el-form-item>
      <el-form-item label="File Name" :label-width="80">
        <el-input v-model="nodeDownloadForm.filename" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="nodeDownloadDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onNodeDownloadClick">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
