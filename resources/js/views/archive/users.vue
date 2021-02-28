<template>
    <div id="users" v-loading="loading">
        <el-row>
            <el-table
              :data="users"
              style="width: 100%">
              <el-table-column
                prop="name"
                label="Name"
                width="180">
              </el-table-column>
              <el-table-column
                label="Avatar"
                width="180">
                  <template slot-scope="scope">
                    <i class="el-icon-time"></i>
                      {{ scope.row.avatar }}
                  </template>
              </el-table-column>
            </el-table>
        </el-row>
        <el-row>
            <div class="pagination-container text-left my-5">
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
        </el-row>
    </div>
</template>

<script>
    import axios from 'axios'
    import { apiError } from '../functions/index'
    const LIMIT = 10

    export default {
        name: 'Users',
        components: {
        },
        props: {
            topicId: {
                type: Number
            },
            usersApi: {
                type: String
            }
        },
        data() {
            return {
                loading: false,
                search: '',
                total: 0,
                cards: [],
                offset: 0,
                limit: LIMIT,
                page: 0,
                pager: 5,
                users: []
            }
        },
        created() {
            this.loadCards()
        },
        mounted: function () {
        },
        methods: {
            loadCards() {
                const URL = this.usersApi + '?offset=' + this.offset + '&limit=' + this.limit + '&search=' + this.search
                this.loading = true
                axios
                    .get(URL)
                    .then(response => {
                        this.users = response.data.data.users
                        this.total = response.data.data.total
                    })
                    .catch((err) => {
                        console.log(err);
                        apiError('Không thể lấy danh sách users')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            handleCurrentChange(val) {
                this.offset = (val - 1) * this.limit
                this.loadCards()
            }
        }
    }
</script>
<style>
    #users .card {
        margin: 10px;
        height: 275px;
    }
</style>
