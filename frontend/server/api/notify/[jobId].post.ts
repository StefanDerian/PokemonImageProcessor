export default defineEventHandler(async (event) => {
  const jobId = getRouterParam(event, 'jobId')
  const body = await readBody(event)

  console.log(`Received notification for job ${jobId}:`, body)

  getNotifier().emit(jobId!, body)

  return { ok: true }
})
