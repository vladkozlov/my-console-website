<template>
  <div id="app">
    <status-bar/>

    <console-window/>
  </div>
</template>

<script>
import StatusBar from "./components/StatusBar.vue";
import ConsoleWindow from "./components/ConsoleWindow.vue";

export default {
  components: {
    StatusBar,
    ConsoleWindow
  }
};
</script>
<style>
body {
  background-color: #1c313a;
}
</style>
