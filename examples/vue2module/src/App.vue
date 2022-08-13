<template>
  <Flipbook class="flipbook" :pages="pages" />
</template>

<script setup>
import Flipbook from 'flipbook-vue/vue2'
const pages = [
  null,
  'images/1.jpg',
  'images/2.jpg',
  'images/3.jpg',
  'images/6.jpg',
]
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
}
.flipbook {
  width: 100vw;
  height: 100vh;
}
</style>
