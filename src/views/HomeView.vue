<script setup lang="ts">
import { fakeDownload } from '@/utils';
import type { AxiosError } from 'axios';
import NodePublicApi from '@/api/nodePublic';
import axios from 'axios';
import IpfsApi from '@/api/ipfs';

onMounted(() => {
  refreshIpfsNodes();
});

const uploadResponse = ref<string | null>(null);
const uploadFile = async (event: Event) => {
  const files = (event?.target as HTMLInputElement)?.files;
  if (!files) return;
  const file = files[0];

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post('http://localhost:5000/api/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    uploadResponse.value = JSON.stringify(res.data, null, 2);
  } catch (error) {
    console.error('Upload failed:', error);
    uploadResponse.value = 'Upload failed';
  }
};

const ipfsNodeList = ref<IpfsNode[]>([
  {
    peerId: 'node1',
    rpcAddress: 'http://127.100.100.100:5001',
    wrapperPublicAddress: 'http://127.100.100.100:3000',
    wrapperAdminAddress: 'http://127.100.100.100:4000',
    nodeStatus: 'Online',
  },
]);

const statusStyle = (status: IpfsNodeStatus): any => {
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

const addNewIpfsNodeDialogVisible = ref(false);
const addNewIpfsNodeForm = reactive({
  rpcAddress: '',
  wrapperPublicAddress: '',
  wrapperAdminAddress: '',
});
const onAddNewIpfsNodeClick = () => {
  addNewIpfsNode();
  addNewIpfsNodeDialogVisible.value = false;
};

const addNewIpfsNode = () => {
  IpfsApi.addIpfsNode(addNewIpfsNodeForm)
    .then((res) => {
      ElMessage.success('Succeed add node');
      console.log('Succeed add node', addNewIpfsNodeForm);
    })
    .catch((err: AxiosError) => {
      console.error('Failed add node', err);
      ElMessage.error('Failed add node');
    });

  // refresh
  refreshIpfsNodes();
};

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

const nodeDownloadDialogVisible = ref(false);
const nodeDownloadForm = reactive({
  nodeAddress: '',
  cid: '',
});
const onNodeDownloadDialogOpen = (row: IpfsNode) => {
  if (!row.wrapperPublicAddress) {
    ElMessage.error("Can't download. Service not available.");
    return;
  }
  nodeDownloadDialogVisible.value = true;
  nodeDownloadForm.nodeAddress = row.wrapperPublicAddress;
};
const onNodeDownloadClick = () => {
  downloadFile(nodeDownloadForm.nodeAddress, nodeDownloadForm.cid);
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

  <!-- Add IPFS node -->
  <el-dialog
    v-model="addNewIpfsNodeDialogVisible"
    title="Download from Node"
    width="500"
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
  >
    <el-form :model="nodeDownloadForm">
      <el-form-item label="cid" :label-width="80">
        <el-input v-model="nodeDownloadForm.cid" />
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
