<script setup lang="ts">
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface DamageIssue {
  type: string
  label: string
  confidence: number
  bbox: [number, number, number, number]
}

interface DamageReport {
  total_issues: number
  condition: string
  issues: DamageIssue[]
}

const props = defineProps<{ jobId: string }>()
const emit = defineEmits<{ remove: [jobId: string] }>()

const { add: addToast } = useToast()

const status = ref<JobStatus>('pending')
const annotatedImageUrl = ref<string | null>(null)
const originalImageUrl = ref<string | null>(null)
const damageReport = ref<DamageReport | null>(null)
const error = ref<string | null>(null)

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

let es: EventSource | null = null

onMounted(() => {
  es = new EventSource(`/api/events/${props.jobId}`)

  es.addEventListener('job_update', (e: MessageEvent) => {
    console.log('Received job update:', e.data);
    if (!e.data) return
    const data = JSON.parse(e.data)

    status.value = data.status
    if (data.annotated_image_url) annotatedImageUrl.value = data.annotated_image_url
    if (data.original_image_url) originalImageUrl.value = data.original_image_url
    if (data.damage_report) damageReport.value = data.damage_report
    if (data.error) error.value = data.error

    if (data.status === 'processing') addToast('Analyzing card…', 'info')
    if (data.status === 'completed') addToast('Analysis complete!', 'success'); es?.close();
    if (data.status === 'failed') addToast(data.error ?? 'Processing failed', 'error'); es?.close();
  });
})

onUnmounted(() => es?.close())
</script>

<template>
  <div class="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-4">

    <!-- Header row -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg
          v-if="status === 'pending' || status === 'processing'"
          class="w-4 h-4 text-indigo-400 animate-spin"
          fill="none" viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span v-else-if="status === 'completed'" class="text-green-400">✓</span>
        <span v-else class="text-red-400">✗</span>

        <span class="text-sm font-medium">{{ statusLabel[status] }}</span>
        <span class="text-xs text-gray-500 font-mono">{{ jobId }}</span>
      </div>

      <button
        class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        @click="emit('remove', jobId)"
      >
        Dismiss
      </button>
    </div>

    <!-- Results -->
    <div v-if="status === 'completed'" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-xs text-gray-500 uppercase tracking-wider">Original</p>
          <img v-if="originalImageUrl" :src="originalImageUrl" alt="Original" class="w-full rounded-lg object-contain bg-gray-950" />
        </div>
        <div class="space-y-1">
          <p class="text-xs text-gray-500 uppercase tracking-wider">Annotated</p>
          <img v-if="annotatedImageUrl" :src="annotatedImageUrl" alt="Annotated" class="w-full rounded-lg object-contain bg-gray-950" />
        </div>
      </div>

      <div v-if="damageReport" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Damage Report</span>
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
            :class="conditionColor[damageReport.condition] ?? 'bg-gray-700 text-gray-300'"
          >
            {{ damageReport.condition }}
          </span>
        </div>
        <p class="text-sm text-gray-400">
          {{ damageReport.total_issues === 0 ? 'No damage detected.' : `${damageReport.total_issues} issue(s) detected` }}
        </p>
        <ul v-if="damageReport.issues.length" class="divide-y divide-gray-800">
          <li
            v-for="(issue, i) in damageReport.issues"
            :key="i"
            class="py-2 flex items-center justify-between text-sm"
          >
            <span class="text-gray-200">{{ issue.label }}</span>
            <span class="text-gray-500">{{ Math.round(issue.confidence * 100) }}% confidence</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Failed -->
    <div v-if="status === 'failed'" class="text-sm text-red-300">
      {{ error ?? 'Processing failed.' }}
    </div>

  </div>
</template>
