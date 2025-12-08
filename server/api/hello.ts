export default defineEventHandler(() => {
  return {
    message: 'Hello from Nuxt Server!',
    timestamp: new Date().toISOString(),
  }
})
