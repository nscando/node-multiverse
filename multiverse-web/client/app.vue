<template>
  <div>
    <agent uuid="62ca4579-ee7b-4e58-bf99-a98342341847" :socket="socket"></agent>
    <metric
      uuid="62ca4579-ee7b-4e58-bf99-a98342341847"
      type="callbackMetric"
      :socket="socket"
    ></metric>
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :socket="socket"
      :key="agent.uuid"
    >
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
