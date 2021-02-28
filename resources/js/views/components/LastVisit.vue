<template>
  <div id="last-visit"></div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LastVisit',

  props: {
    itemId: {
      type: Number,
      required: true
    },
    loggedIn: {
      type: Boolean,
      required: true
    },
  },

  data () {
    return {
        lastVisitApi: `/topic/${this.itemId}/visit`,
    }
  },

  created() {
      this.updateLastVisit()
  },

  methods: {
      updateLastVisit() {
          axios
              .put(this.lastVisitApi)
              .then(() => {
              })
              .catch(() => {
              })
      }
  }
}
</script>
