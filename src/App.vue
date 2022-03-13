<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'No War in Ukraine',
  meta: [
    { name: 'description', content: 'Attack enemy sites' },
  ],
})
</script>

<template>
  <router-view />
</template>
