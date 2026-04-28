export default defineEventHandler(async (event) => {
  const jobId = getRouterParam(event, 'jobId')
  const body = await readBody(event)

  getNotifier().emit(jobId!, body)

  return { ok: true }
})
