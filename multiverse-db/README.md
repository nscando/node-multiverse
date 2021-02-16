# multiverse-db

## Usage

```js
const setupDatabase = require("multiverse-db");

setupDatabase(config)
  .then((db) => {
    const { Agent, metric } = db;
  })
  .catch((err) => console.error(err));
```
