<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()

const jobIds = ref<string[]>([])

onMounted(() => {
  const jobId = route.query.jobId as string | undefined
  if (jobId) jobIds.value.push(jobId)
})

function removeJob(jobId: string) {
  jobIds.value = jobIds.value.filter(id => id !== jobId)
}

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadError = ref<string | null>(null)

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  uploadError.value = null
}

async function analyzeCard() {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadError.value = null

  try {
    const form = new FormData()
    form.append('image', selectedFile.value)

    const res = await fetch(`${config.public.uploadUrl}/upload`, {
      method: 'POST',
      body: form,
    })

    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)

    const { job_id } = await res.json()
    jobIds.value.push(job_id)

    selectedFile.value = null
    previewUrl.value = null
    if (fileInput.value) fileInput.value.value = ''
  } catch (err: any) {
    uploadError.value = err.message
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-4xl mx-auto px-4 py-12">

      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold tracking-tight">Pokemon Card Analyzer</h1>
        <p class="mt-2 text-gray-400">Upload a card image to detect tears, water damage, and creases</p>
      </div>

      <!-- Upload zone -->
      <div
        class="border-2 border-dashed rounded-2xl p-10 text-center transition-colors"
        :class="isDragging ? 'border-indigo-400 bg-indigo-950/30' : 'border-gray-700 hover:border-gray-500'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <div v-if="!selectedFile">
          <div class="text-5xl mb-4">🃏</div>
          <p class="text-gray-300 font-medium">Drag &amp; drop a card image here</p>
          <p class="text-gray-500 text-sm mt-1">or</p>
          <button
            class="mt-4 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
            @click="fileInput?.click()"
          >
            Choose file
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />
        </div>

        <!-- Preview -->
        <div v-else class="space-y-4">
          <img :src="previewUrl!" alt="Preview" class="max-h-64 mx-auto rounded-xl object-contain" />
          <p class="text-gray-400 text-sm">{{ selectedFile.name }}</p>
          <div class="flex justify-center gap-3">
            <button
              class="px-5 py-2 rounded-lg border border-gray-600 hover:border-gray-400 text-sm transition-colors"
              @click="fileInput?.click()"
            >
              Change
            </button>
            <button
              class="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors disabled:opacity-50"
              :disabled="isUploading"
              @click="analyzeCard"
            >
              {{ isUploading ? 'Uploading…' : 'Analyze Card' }}
            </button>
          </div>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />
        </div>
      </div>

      <!-- Upload error -->
      <div v-if="uploadError" class="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-700 text-red-300 text-sm">
        {{ uploadError }}
      </div>

      <!-- Job cards -->
      <div v-if="jobIds.length" class="mt-8 space-y-4">
        <JobStatusCard
          v-for="id in jobIds"
          :key="id"
          :job-id="id"
          @remove="removeJob"
        />
      </div>

    </div>
  </div>
</template>
