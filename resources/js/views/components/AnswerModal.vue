<template>
    <el-dialog
        title="Kết quả"
        :visible="visible"
        center
        class="dialog-post answer-dialog"
        @close="closeAnswerModal"
    >
        <div v-loading="loading" class="centered">
            <div class="icon icon-xl icon-shape bg-gradient-success rounded-circle text-white mb-3"><i class="ni ni-trophy"></i></div>
            <el-progress :percentage="percent | round" color="#5cb87a" />
            <br>
            <div>
                <span class="text-success"><i class="el-icon-check"></i> {{ correct }} câu đúng</span>
                <span class="text-danger"><i class="el-icon-close"></i> {{ incorrect }} câu sai</span>
            </div>
            <el-table
              v-if="answers.length > 0"
              :data="answers"
              fit
            >
              <el-table-column
                label=""
                width="180">
                  <template slot-scope="scope">
                      <span class="text-success">{{ scope.row.word }}</span>
                  </template>
              </el-table-column>
              <el-table-column
                label=""
                width="180">
                  <template slot-scope="scope">
                      <span v-if="scope.row.result" class="text-success"><i class="el-icon-check"></i> {{ scope.row.answer }}</span>
                      <span v-else class="text-danger"><i class="el-icon-close"></i>{{ scope.row.answer }}</span>
                  </template>
              </el-table-column>
            </el-table>
            <br>
            <div class="pagination-container text-center">
                <el-pagination
                        v-if="total > limit"
                        :total="total"
                        :page-size="limit"
                        :pager-count="pager"
                        :current-page="page"
                        background
                        layout="prev, pager, next"
                        @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </el-dialog>
</template>
<script>
    import axios from 'axios'
    import {apiError} from '../functions/index'

    const LIMIT = 20

    export default {
        name: 'AnswerModal',
        props: {
            visible: {
              type: Boolean
            },
            resultsApi: {
              type: String
            },
            wordsCount: {
                type: Number
            },
        },
        filters: {
            round(val) {
                return parseInt(val);
            }
        },
        data() {
            return {
                loading: false,
                percent: 50,
                correct: 50,
                incorrect: 50,
                answers: [],
                total: 0,
                offset: 0,
                limit: LIMIT,
                page: 0,
                pager: 5,
            }
        },
        created() {
            this.loadResults()
        },
        methods: {
            loadResults() {
                const URL = this.resultsApi + '?offset=' + this.offset + '&limit=' + this.limit
                this.loading = true
                axios
                    .get(URL)
                    .then(response => {
                        this.answers = response.data.data.answers
                        this.total = response.data.data.total
                        this.correct = response.data.data.correct
                        this.incorrect = response.data.data.incorrect
                        this.percent = (this.correct / this.wordsCount) * 100
                    })
                    .catch(() => {
                        apiError('Không thể lấy danh sách câu trả lời')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            handleCurrentChange(val) {
                this.offset = (val - 1) * this.limit
                this.loadCards()
            },
            closeAnswerModal() {
                this.$emit('closeAnswerModal')
            },
            goRefresh() {
                window.location.reload()
            }
        }
    }
</script>
<style>
    .answer-dialog .el-table {
        width: 500px;
        margin: 0 auto;
    }
    .answer-dialog .el-table td {
        text-align: center;
    }
    .answer-dialog .el-table__body, .answer-dialog .el-table__footer, .answer-dialog .el-table__header {
        width: 100% !important;
    }
</style>
