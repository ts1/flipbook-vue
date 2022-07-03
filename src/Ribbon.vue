<template>
  <div class="github-ribbon">
    <a target="_blank" href="https://github.com/ts1/flipbook-vue">Fork me on GitHub</a>
  </div>
</template>

<style scoped>
.github-ribbon {
  position: fixed;
  right: 0px;
  top: 0px;
  width: 150px;
  height: 150px;
  overflow: hidden;
  z-index: 99999;
}
.github-ribbon a {
  display: inline-block;
  width: 200px;
  overflow: hidden;
  padding: 6px 0px;
  text-align: center;
  transform: rotate(45deg);
  text-decoration: none;
  color: rgb(255, 255, 255);
  position: inherit;
  top: 45px;
  right: -40px;
  font: 700 13px "Helvetica Neue", Helvetica, Arial, sans-serif;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 2px 3px 0px;
  background-color: rgb(170, 0, 0);
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
  border-width: 1px 0px;
  border-style: dotted;
  border-color: rgba(255, 255, 255, 0.7);
}
</style>
