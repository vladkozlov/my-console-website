<template>
  <div id="app">
    <console-window :isMoved="consoleMoved" :scrH="windowHeight" :scrW="windowWidth" @moved="consoleMoved = true"/>
  </div>
</template>

<script>
import StatusBar from "./components/StatusBar.vue";
import ConsoleWindow from "./components/ConsoleWindow.vue";

export default {
  components: {
    StatusBar,
    ConsoleWindow
  },
  data() {
    return {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      consoleMoved: false
    }
  },
  mounted() {
    window.addEventListener('resize', () =>{
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
    })
  },
};
</script>
<style>
body {
  background-color: #1c313a;
}
</style>
