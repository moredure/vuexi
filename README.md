# Vuexi

```javascript
import * as InstancesClient from '@/resources/instances'
import { begin, one, error, action } from 'vuexi'

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
    queryInstances: action(QUERY_INSTANCES, InstancesClient.getInstances)
  },
  mutations: {
    [QUERY_INSTANCES]: begin('isQueryInstancesLoading', 'queryInstancesError'),
    [QUERY_INSTANCES_SUCCESS]: one('isQueryInstancesLoading', 'instances'),
    [QUERY_INSTANCES_FAILURE]: error('isQueryInstancesLoading', 'queryInstancesError')
  }
}
```
