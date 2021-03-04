# multiverse-agent

## Usage

```js
const MultiverseAgent = require('multiverse-agent')

const agent = new MultiverseAgent({
  interval: 2000,
})

agent.connect()

// This agent only
agent.on('connected')
agent.on('disconnected')
agent.on('message')

// Others agents
agent.on('agent/connected')
agent.on('agent/disconnected')
agent.on('agent/message', (payload) => {
  console.log(payload)
})

setTimeout(() => agent.disconnect(), 20000)
```
