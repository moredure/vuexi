# Vuexi
Vuexi is a toolset of small but very useful functions to reduce vuex code base for async flows.
To check entire functionality consider to look into index.js file. Also soon you will be able to checkout presentation of this library in https://odessafrontend.com/15/ check out YouTube section.

```npm install mikefaraponov/vuexi@master```

```javascript
import * as InstancesClient from '@/resources/instances'
import { begin, success, error, query, poll } from 'vuexi'

const QUERY_INSTANCES = 'QUERY_INSTANCES'
const QUERY_INSTANCES_SUCCESS = 'QUERY_INSTANCES_SUCCESS'
const QUERY_INSTANCES_FAILURE = 'QUERY_INSTANCES_FAILURE'

export default {
  namespaced: true,
  state: {
    instances: [],
    isQueryInstancesLoading: false,
    queryInstancesError: null
  },
  actions: {
    // InstancesClient.getInstances is a axious call
    queryInstances: query(QUERY_INSTANCES, InstancesClient.getInstances), // used for initial load of state
    pollInstances: poll(QUERY_INSTANCES, InstancesClient.getInstances), // used for polling purposes with setInterval
  },
  mutations: {
    [QUERY_INSTANCES]: begin('isQueryInstancesLoading', 'queryInstancesError'), // essentialy is a macros to set isQueryInstancesLoading to true and queryInstancesError to null
    [QUERY_INSTANCES_SUCCESS]: success('isQueryInstancesLoading', 'instances'), // sets isQueryInstancesLoading to false and instances from axios data object provided to this mutation from "query" or "poll" helper
    // success call can be replaces with any other to modify state on your purpose (removeById, push element, etc)
    [QUERY_INSTANCES_FAILURE]: error('isQueryInstancesLoading', 'queryInstancesError') // sets isQueryInstancesLoading to false and queryInstancesError to error from axious call provided to this mutation
  }
}
```

## Sponsors
Vuexi used by [ScalableSpace](https://scalablespace.net) and by [ScaleChamp](https://scalechamp.com)
