<template>
  <div>
    <metric
      uuid="672988c3-c661-488e-a5ea-2ec70285215d"
      type="callbackMetric"
      :socket="socket"
    ></metric>
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid">
    </agent>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<style>
body {
  font-family: Arial;
  background: #f8f8f8;
  margin: 0;
}
</style>

<script>
const io = require('socket.io-client')
const socket = io()
module.exports = {
  data() {
    return {
      agents: [],
      error: null,
      socket,
    }
  },
  mounted() {
    this.initialize()
  },
  methods: {
    initialize() {},
  },
}
</script>
