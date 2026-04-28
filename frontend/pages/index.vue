<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const { state, connect, reset } = useJobStatus()

let eventSource: EventSource | null = null

onMounted(() => {
  const jobId = route.query.jobId as string | undefined
  if (!jobId) return

  eventSource = new EventSource(`/api/events/${jobId}`)

  eventSource.addEventListener('job_update', (e: MessageEvent) => {
    const data = JSON.parse(e.data)
    connect(data.job_id ?? jobId)
  })

  eventSource.onerror = () => {
    eventSource?.close()
  }
})

onUnmounted(() => {
  eventSource?.close()
})

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
  reset()
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
    connect(job_id)
  } catch (err: any) {
    uploadError.value = err.message
  } finally {
    isUploading.value = false
  }
}

function startOver() {
  selectedFile.value = null
  previewUrl.value = null
  uploadError.value = null
  reset()
  if (fileInput.value) fileInput.value.value = ''
}

const conditionColor: Record<string, string> = {
  Mint: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Played: 'bg-yellow-100 text-yellow-800',
  Damaged: 'bg-red-100 text-red-800',
}

const statusLabel: Record<string, string> = {
  pending: 'Queued',
  processing: 'Analyzing…',
  completed: 'Done',
  failed: 'Failed',
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
        v-if="!state.status || state.status === 'idle'"
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

      <!-- Status panel -->
      <div v-if="state.status !== 'idle'" class="mt-8 space-y-6">

        <!-- Status bar -->
        <div class="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div class="flex items-center gap-3">
            <!-- Spinner -->
            <svg
              v-if="state.status === 'pending' || state.status === 'processing'"
              class="w-5 h-5 text-indigo-400 animate-spin"
              fill="none" viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span v-else-if="state.status === 'completed'" class="text-green-400 text-lg">✓</span>
            <span v-else class="text-red-400 text-lg">✗</span>

            <span class="font-medium">{{ statusLabel[state.status] }}</span>
          </div>

          <button
            class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            @click="startOver"
          >
            Start over
          </button>
        </div>

        <!-- Results -->
        <div v-if="state.status === 'completed'" class="space-y-6">

          <!-- Images side by side -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Original</p>
              <img
                v-if="state.originalImageUrl"
                :src="state.originalImageUrl"
                alt="Original card"
                class="w-full rounded-xl object-contain bg-gray-900"
              />
            </div>
            <div class="space-y-2">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Annotated</p>
              <img
                v-if="state.annotatedImageUrl"
                :src="state.annotatedImageUrl"
                alt="Annotated card"
                class="w-full rounded-xl object-contain bg-gray-900"
              />
            </div>
          </div>

          <!-- Damage report -->
          <div v-if="state.damageReport" class="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">Damage Report</h2>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="conditionColor[state.damageReport.condition] ?? 'bg-gray-700 text-gray-300'"
              >
                {{ state.damageReport.condition }}
              </span>
            </div>

            <p class="text-sm text-gray-400">
              {{ state.damageReport.total_issues === 0
                ? 'No damage detected — card looks great!'
                : `${state.damageReport.total_issues} issue${state.damageReport.total_issues > 1 ? 's' : ''} detected` }}
            </p>

            <ul v-if="state.damageReport.issues.length" class="divide-y divide-gray-800">
              <li
                v-for="(issue, i) in state.damageReport.issues"
                :key="i"
                class="py-3 flex items-center justify-between text-sm"
              >
                <span class="text-gray-200">{{ issue.label }}</span>
                <span class="text-gray-500">{{ Math.round(issue.confidence * 100) }}% confidence</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Failed state -->
        <div v-if="state.status === 'failed'" class="p-4 rounded-xl bg-red-950/50 border border-red-700 text-red-300 text-sm">
          Processing failed{{ state.error ? `: ${state.error}` : '.' }}
        </div>
      </div>

    </div>
  </div>
</template>
