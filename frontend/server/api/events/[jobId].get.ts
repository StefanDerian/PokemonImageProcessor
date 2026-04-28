export default defineEventHandler(async (event) => {
  const jobId = getRouterParam(event, 'jobId')
  const eventStream = createEventStream(event)

  const handler = (data: unknown) => {
    eventStream.push({ event: 'job_update', data: JSON.stringify(data) })
  }

  getNotifier().on(jobId!, handler)

  eventStream.onClosed(() => {
    getNotifier().off(jobId!, handler)
  })

  return eventStream.send()
})
