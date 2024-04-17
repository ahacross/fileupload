<template>
  <div>
    <input type="file" multiple @change="handleFiles" ref="fileInput" hidden />
    <div @click="browseFiles" class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      여기에 파일을 드롭하세요
    </div>
    <div class="file-items">
      <div v-for="(item, index) in files" :key="index" class="file-item">
        <img src="@/assets/file.svg" class="file-icon" alt="file" />
        <div class="file-info">
          <span>{{ item.file.name }}</span>
          <span>
            ({{ formatFileSize(item.uploadedSize) }} / {{ formatFileSize(item.file.size) }})
          </span>
          <progress v-if="item.progress < 100" :value="item.progress" max="100"></progress>
        </div>
        <img
          src="@/assets/close.svg"
          class="remove-button"
          alt="close"
          @click="removeFile(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

console.log(import.meta.env)
axios.defaults.baseURL = import.meta.env.MODE === 'prd' ? import.meta.env.VITE_API_SERVER : ''
console.log(axios.defaults.baseURL)

const maxFileSize = 1 * 1024 * 1024 * 1024 // 1GB
const fileInput = ref(null)
const files = ref([])

const browseFiles = () => {
  fileInput.value.click()
}

const handleFiles = (event) => {
  addFiles(event.target.files)
}

const handleDrop = (event) => {
  addFiles(event.dataTransfer.files)
}

const formatFileSize = (size = 0) => {
  const units = ['bytes', 'KB', 'MB', 'GB']
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return size.toFixed(2) + ' ' + units[unitIndex]
}

const addFiles = (fileList) => {
  for (let file of fileList) {
    if (file.size > maxFileSize) {
      alert(
        `File size should not exceed 1GB. ${file.name} exceeds by ${formatFileSize(file.size)}.`
      )
      continue
    }
    const cancelTokenSource = axios.CancelToken.source()
    const fileData = { file, progress: 0, uploadedSize: 0, status: '', cancelTokenSource }
    files.value.push(fileData)
    uploadFile(fileData)
  }
}

const removeFile = async (index) => {
  const fileData = files.value[index]
  if (fileData.status === 'uploading') {
    fileData.cancelTokenSource.cancel('File upload cancelled by the user.')
  } else if (fileData.status === 'completed') {
    try {
      const response = await axios.post('/fast/delete', { filename: fileData.serverFilename })
      console.log('File deleted:', response.data)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }
  files.value.splice(index, 1)
}

const uploadFile = async (fileData) => {
  const formData = new FormData()
  formData.append('file', fileData.file)
  fileData.status = 'uploading'

  try {
    const response = await axios.post('/fast/upload', formData, {
      onUploadProgress: (progressEvent) => {
        console.log(progressEvent.loaded, progressEvent.total)
        fileData.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        fileData.uploadedSize = progressEvent.loaded
        files.value = [...files.value] // 반응성 업데이트
      }
    })
    fileData.status = 'completed'
    fileData.serverFilename = response.data.filename
    files.value = [...files.value] // 상태 업데이트
  } catch (error) {
    console.error('Error uploading file:', error)
    fileData.status = 'error'
    files.value = [...files.value] // 에러 상태 업데이트
  }
}
</script>

<style lang="scss">
.upload-area {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #ccc;
  padding: 20px;
  cursor: pointer;
}

.file-items {
  display: flex;
  flex-wrap: wrap;

  .file-item {
    flex: 0 0 50%;
    display: flex;
    margin-top: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    position: relative;

    .file-icon {
      width: 50px;
      height: 50px;
    }

    .file-info {
      margin-left: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .remove-button {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
}
</style>
