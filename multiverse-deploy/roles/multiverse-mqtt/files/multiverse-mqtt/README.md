# multiverse-mqtt

## `agent/connected`

```js
{
    agent:{
        uuid,//autogenerate
        username,//define by configuration
        name,//define by configuration
        hostname,//obtain from SO
        pid,//obtain from proccess

    }

}
```

## `agent/disconnected`

```js
{
  agent: {
    uuid
  }
}
```

## `agent/message`

```js

{
    agent,
    metrics:[
        {
            type,
            value
        }
    ],
    timestamp //generate when create the message
}

```
