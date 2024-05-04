<script setup lang="ts">
import { fakeDownload } from '@/utils';
import type { AxiosError } from 'axios';
import NodePublicApi from '@/api/nodePublic';
import axios from 'axios';
import IpfsApi from '@/api/ipfs';
import PinApi from '@/api/pin';
import FileApi from '@/api/file';

// TODO: 看能不能查询pin在哪些节点

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
    wrapperPublicAddress: '192.168.177.134:3001',
    wrapperAdminAddress: 'wrapper-1:4000',
  },
  {
    rpcAddress: 'slave-ipfs-2:5001',
    wrapperPublicAddress: '192.168.177.134:3002',
    wrapperAdminAddress: 'wrapper-2:4000',
  },
];

interface UploadFileResponse {
  requestId: string;
  fileMetadata: {
    name: string;
    hash: string;
    size: string;
  };
}
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
        // TODO: 'multipart/form-data'
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      }
    );
    console.log('Success upload file', res.data);
    let result: UploadFileResponse = res.data.data;
    uploadResponse.value = JSON.stringify(result.fileMetadata);
  } catch (error) {
    console.error('Upload failed:', error);
    uploadResponse.value = 'Upload failed';
  }
};

const downloadFile = () => {
  FileApi.downloadFileAdvice(downloadFileForm.value.cid)
    .then((res) => {
      let url = res.data.data.url;
      console.log('Succeed get download advice', url);
      downloadFileFromUrl(
        downloadFileForm.value.cid,
        url,
        downloadFileForm.value.filename
      );
    })
    .catch((err: AxiosError) => {
      console.error('Failed get download advice', err);
      ElMessage.error('Failed add node');
    });
};

const downloadFileForm = ref({
  cid: '',
  filename: '',
});

const downloadFileFromUrl = (
  cid: string,
  url: string,
  opt_filename?: string
) => {
  ElMessage.info('Download ' + cid + ' from ' + url);
  console.log('Download ' + cid + ' from ' + url);

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
  NodePublicApi.downloadWithUrl(url, { filename })
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

interface IpfsNodeInTable extends IpfsNode {
  storedCids?: string[];
}
const ipfsNodeList = ref<IpfsNodeInTable[]>([]);

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
      // console.log('Success refresh nodes', res.data);
      ipfsNodeList.value = res.data.data.list;
      ipfsNodeList.value.map((node) => {
        Object.assign(node, { storedCids: [] });
      });

      Promise.all(
        ipfsNodeList.value.map((node) => {
          console.log('target node id', node.id);
          return getPinsOfNode(node);
        })
      )
        .then((res) => {
          // console.log('Succeed refresh pins');
        })
        .catch((err) => {
          // never
          console.error('Failed refresh pins', err);
        });
    })
    .catch((err: AxiosError) => {
      console.error('Failed refresh nodes', err);
      ElMessage.error('Failed refresh nodes');
    });
};

const getPinsOfNode = async (node: IpfsNodeInTable) => {
  try {
    let pinsRes = await PinApi.listPinsInOneNodeActually(node.id);
    let pins = pinsRes.data.data.pinsCid;
    node.storedCids = pins;
  } catch (err) {
    console.error('Failed get pins of node', node, err);
  }
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
  ElMessage.info(
    'Begin add all initial IPFS nodes. Nodes num: ' + initialIpfsNodes.length
  );
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
    ElMessage.success('Finish add all initial IPFS nodes');
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
const downloadFileFromNode = (
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
  NodePublicApi.downloadWithCid(targetUrl, cid, { filename })
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
const onNodeDownloadDialogOpen = (row: IpfsNode) => {
  if (!row.wrapperPublicAddress) {
    ElMessage.error("Can't download. Service not available.");
    return;
  }
  nodeDownloadDialogVisible.value = true;
  nodeDownloadForm.nodeAddress = row.wrapperPublicAddress;
};
const onNodeDownloadClick = () => {
  downloadFileFromNode(
    nodeDownloadForm.nodeAddress,
    nodeDownloadForm.cid,
    nodeDownloadForm.filename
  );
  nodeDownloadDialogVisible.value = false;
};

const pinCidToFindNodes = ref('');
const findNodesStorePinLegallyResult = ref<string[]>([]);
const findNodesStorePinLegally = () => {
  console.log('Find nodes store pin legally');
  PinApi.listNodesWithPin(pinCidToFindNodes.value)
    .then((res) => {
      ElMessage.success('Succeed find nodes store pin legally');
      console.log('Succeed find nodes store pin legally', res);
      findNodesStorePinLegallyResult.value = res.data.data.nodes.map((v) => {
        return v.id;
      });
      // refresh
      refreshIpfsNodes();
    })
    .catch((err: AxiosError) => {
      console.error('Failed find nodes store pin legally', err);
      ElMessage.error('Failed find nodes store pin legally');
    });
};
// Judge highlight
const nodeTableRowClassName = computed(() => {
  return (row: IpfsNode) => {
    return findNodesStorePinLegallyResult.value.includes(row.id)
      ? 'highlight-row'
      : '';
  };
});
</script>

<template>
  <div id="upload-file-part">
    <input type="file" id="file" @change="uploadFile" class="file-input" />
    <label for="file" class="file-label">Upload File</label>
    <div id="display-uploaded-file">{{ uploadResponse }}</div>
  </div>

  <br />

  <div id="download-file-part">
    <el-form :model="downloadFileForm">
      <el-form-item label="CID" :label-width="80">
        <el-input v-model="downloadFileForm.cid" />
      </el-form-item>
      <el-form-item label="File Name" :label-width="80">
        <el-input v-model="downloadFileForm.filename" />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="downloadFile"> Download File </el-button>
  </div>

  <br />

  <el-button type="info" @click="refreshIpfsNodes"
    >Refresh Node Table</el-button
  >

  <el-button type="primary" @click="addNewIpfsNodeDialogVisible = true"
    >Add IPFS node</el-button
  >
  <el-button type="primary" @click="reBootstrapAll"
    >Re-bootstrap all IPFS node</el-button
  >
  <el-button type="primary" @click="addAllInitialIpfsNodes"
    >Quick add all initial IPFS node</el-button
  >

  <br /><br />

  <el-input
    v-model="pinCidToFindNodes"
    style="width: 240px"
    placeholder="Input a CID"
  />
  <el-button type="primary" @click="findNodesStorePinLegally"
    >Hight nodes with pin</el-button
  >

  <br /><br />

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

  <!-- TODO: 高亮findNodesStorePinLegallyResult -->
  <el-table
    :data="ipfsNodeList"
    :row-class-name="nodeTableRowClassName"
    style="width: 100%"
    max-height="800"
  >
    <el-table-column fixed prop="peerId" label="Peer Id" width="200" />
    <el-table-column prop="rpcAddress" label="RPC Address" width="220" />
    <el-table-column
      prop="wrapperPublicAddress"
      label="Wrapper Public Address"
      width="220"
    />
    <el-table-column
      prop="wrapperAdminAddress"
      label="Wrapper Admin Address"
      width="220"
    />
    <el-table-column label="Status">
      <template #default="scope">
        <span :style="statusStyle(scope.row.nodeStatus)">{{
          scope.row.nodeStatus
        }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="storedCids" label="Stored CIDs" width="180">
      <template #default="{ row }">
        <el-tooltip class="item" effect="dark" placement="top">
          <template #content>
            <span v-for="(cid, index) in row.storedCids" :key="index"
              >{{ cid }}<br
            /></span>
          </template>
          <span>{{ 'Stored CID length:' + row.storedCids.length }}</span>
        </el-tooltip>
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

<style scoped>
.highlight-row {
  background-color: #f0f9eb; /* 选择一个明显的颜色 */
}

#upload-file-part {
  /* height: 80px; */
  background-color: #e4e4db;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
}

#display-uploaded-file {
  width: 1000px;
  margin-left: 20px;
}

/* 隐藏原始的文件输入 */
.file-input {
  display: none;
}

/* 自定义标签样式 */
.file-label {
  display: inline-block;
  padding: 10px 20px;
  color: white;
  background-color: #007bff;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* 鼠标悬停时的背景颜色变化 */
.file-label:hover {
  background-color: #0056b3;
}

#download-file-part {
  background-color: #e2e2d4;
  width: 600px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
