<script setup lang="ts">
const { toasts, remove } = useToast()

const typeClass: Record<string, string> = {
  info: 'bg-gray-800 border-gray-600 text-gray-100',
  success: 'bg-green-900 border-green-600 text-green-100',
  error: 'bg-red-900 border-red-600 text-red-100',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg min-w-[220px] max-w-xs"
          :class="typeClass[toast.type]"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button class="opacity-50 hover:opacity-100 transition-opacity text-base leading-none" @click="remove(toast.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
