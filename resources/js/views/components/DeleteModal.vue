<template>
  <el-dialog
    :visible="isShowDelete"
    :close-on-click-modal="false"
    :title="'Xóa từ vựng: ' + wordName"
    append-to-body
    @close="$emit('cancelDeleteWord')"
    class="eg-dialog"
  >
    <p class=""><span class="text-danger">Từ vựng này sẽ bị xóa và không thể phục hồi!</span></p>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="isDisabledDelete" type="danger" icon="el-icon-delete-solid" @click.once="$emit('deleteWord')">Xóa</el-button>
      <el-button type="default" @click="$emit('cancelDeleteWord')">Hủy</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DeleteModal',

  props: {
    wordName: {
      type: String
    },
    isShowDelete: {
      type: Boolean
    },
    isDisabledDelete: {
      type: Boolean
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
