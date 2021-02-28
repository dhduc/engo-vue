<template>
    <el-dialog
        title="Kết quả"
        :visible="visible"
        :show-close="true"
        center
        class="dialog-post eg-dialog"
        @close="closeResultModal"
    >
        <div class="topic-box">
            <div class="centered">
                <el-progress :percentage="percent" color="#5cb87a" type="circle" />
                <br>
                <p class="h2 text-warning">{{ correct }} câu trả lời đúng</p>
                <br>
                <el-button icon="el-icon-refresh" type="primary" @click="goRefresh">Bắt đầu lại</el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script>
    export default {
        name: 'ResultModal',
        props: {
            visible: {
              type: Boolean
            },
            percent: {
              type: Number
            },
            correct: {
              type: Number
            }
        },
        data() {
            return {
            }
        },
        created() {
        },
        methods: {
            closeResultModal() {
                this.$emit('closeResultModal')
            },
            goRefresh() {
                this.$emit('goRefresh')
            }
        }
    }
</script>
