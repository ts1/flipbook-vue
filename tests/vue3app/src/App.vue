<template>
  <Flipbook class="flipbook" :pages="pages" />
</template>

<script setup>
import Flipbook from 'flipbook-vue'
const pages = [
  null,
  'images/1.jpg',
  'images/2.jpg',
  'images/3.jpg',
  'images/4.jpg',
  'images/5.jpg',
  'images/6.jpg',
]
</script>

<style scoped>
.flipbook {
  width: 100vw;
  height: 100vh;
}
</style>
