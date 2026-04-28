export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed'

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

interface JobState {
  status: JobStatus
  annotatedImageUrl: string | null
  originalImageUrl: string | null
  damageReport: DamageReport | null
  error: string | null
}

export function useJobStatus() {
  const { add: addToast } = useToast()

  const state = reactive<JobState>({
    status: 'idle',
    annotatedImageUrl: null,
    originalImageUrl: null,
    damageReport: null,
    error: null,
  })

  let eventSource: EventSource | null = null

  function connect(jobId: string) {
    reset()
    state.status = 'pending'

    eventSource = new EventSource(`/api/events/${jobId}`)

    eventSource.addEventListener('job_update', (e: MessageEvent) => {
      const data = JSON.parse(e.data)
      const prev = state.status
      state.status = data.status
      if (data.annotated_image_url) state.annotatedImageUrl = data.annotated_image_url
      if (data.original_image_url) state.originalImageUrl = data.original_image_url
      if (data.damage_report) state.damageReport = data.damage_report
      if (data.error) state.error = data.error

      if (data.status === 'processing' && prev !== 'processing') addToast('Analyzing card…', 'info')
      if (data.status === 'completed') addToast('Analysis complete!', 'success')
      if (data.status === 'failed') addToast(data.error ?? 'Processing failed', 'error')
    })

    eventSource.addEventListener('done', () => {
      eventSource?.close()
    })

    eventSource.onerror = () => {
      if (state.status === 'completed' || state.status === 'failed') {
        eventSource?.close()
      }
    }
  }

  function reset() {
    eventSource?.close()
    eventSource = null
    state.status = 'idle'
    state.annotatedImageUrl = null
    state.originalImageUrl = null
    state.damageReport = null
    state.error = null
  }

  onUnmounted(() => {
    eventSource?.close()
  })

  return { state: readonly(state), connect, reset }
}
