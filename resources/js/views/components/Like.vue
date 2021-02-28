<template>
  <div v-if="isShowLike" id="like">
    <i
      class="fa-2x ml-0"
      :class="[isLiked ? 'fas fa-heart text-danger' : 'far fa-heart']"
      style="user-select: none;"
      :style="[isLoggedIn ? { cursor: 'pointer' } : '']"
      aria-hidden="true"
      @click="toggleLike"
    /> {{ count }} lượt thích
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Like',
  props: {
    liked: {
      type: Boolean,
      required: true
    },

    likesCount: {
      type: Number,
      required: true
    },

    itemType: {
      type: String,
      required: true
    },

    itemId: {
      type: Number,
      required: true
    },

    loggedIn: {
      type: Boolean,
      required: true
    },

    topicUrl: {
      type: String
    },

    topicTitle: {
      type: String
    }
  },

  data () {
    return {
      isShowLike: true,
      isLiked: this.liked,
      isLoggedIn: this.loggedIn,
      count: this.likesCount,
      likeApi: `/${this.itemType}/${this.itemId}/like`,
      lastVisitApi: `/${this.itemType}/${this.itemId}/visit`,
      isLoading: false
    }
  },

  created() {
//      this.updateLike()
      this.updateLastVisit()
  },

  methods: {
    updateLike() {
        axios
        .put(this.likeApi)
        .then(() => {
        })
        .catch(() => {
        })
    },
    updateLastVisit() {
        axios
        .put(this.lastVisitApi)
        .then(() => {
        })
        .catch(() => {
        })
    },
    toggleLike () {
      if (this.isLoading || !this.isLoggedIn) {
        return
      }

      if (this.isLiked) {
        return this.dislike()
      }

      this.like()
    },

    like () {
      this.isLoading = true

      axios
        .post(this.likeApi)
        .then(() => {
          this.isLoading = false
          this.isLiked = true
          this.count++
        })
        .catch(() => {
          this.isLoading = false
        })
    },

    dislike () {
      this.isLoading = true

      axios
        .delete(this.likeApi)
        .then(() => {
          this.isLoading = false
          this.isLiked = false
          this.count--
        })
        .catch(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
