<template>
  <div id="app">
    <!-- This will render the current route component -->
    <router-view></router-view>
  </div>
</template>

<script setup>
// If you need any app-wide logic, you can add it here
</script>

<style>
/* You can add any global styles here if needed */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>