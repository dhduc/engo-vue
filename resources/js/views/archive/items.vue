<template>
    <div id="cards" v-loading="loading">
        <el-row>
            <el-table
              :data="words"
              style="width: 100%">
              <el-table-column
                prop="en"
                label="Từ gốc"
                width="180">
              </el-table-column>
              <el-table-column
                prop="type"
                label="Từ loại"
                width="180">
              </el-table-column>
              <el-table-column
                prop="vi"
                label="Ý nghĩa"
                width="180">
              </el-table-column>
              <el-table-column
                prop="phonetic"
                label="Phát âm"
                width="180">
              </el-table-column>
              <el-table-column
                label="Lắng nghe"
                width="180">
                  <template slot-scope="scope">
                    <el-button :disabled="scope.row.sound === null" title="Phát âm" type="primary" circle @click="playSound(scope.row.sound)">
                        <i class="fas fa-volume-up"></i>
                    </el-button>
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
        name: 'Items',
        components: {
        },
        props: {
            topicId: {
                type: Number
            },
            wordsApi: {
                type: String
            },
            speechApi: {
                type: String
            }
        },
        data() {
            return {
                loading: false,
                search: '',
                total: 0,
                wordId: null,
                word: null,
                wordName: null,
                cards: [],
                offset: 0,
                limit: LIMIT,
                page: 0,
                pager: 5,
                words: [],
                wordAudio: null,
                field: null,
                audioPlay: false,
                tLoading: false,
            }
        },
        created() {
            this.loadCards()
        },
        mounted: function () {
        },
        methods: {
            loadCards() {
                const URL = this.wordsApi + '?offset=' + this.offset + '&limit=' + this.limit + '&search=' + this.search
                this.loading = true
                axios
                    .get(URL)
                    .then(response => {
                        this.words = response.data.data.words
                        this.total = response.data.data.total
                    })
                    .then(() => {
                        this.words.forEach((word) => {
                            this.setAudio(word)
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                        apiError('Không thể lấy danh sách từ vựng')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            handleCurrentChange(val) {
                this.offset = (val - 1) * this.limit
                this.loadCards()
            },
            fetchAudio(URL) {
                return fetch(URL)
                    .then((res) => {
                        let reader = res.body.getReader();
                        return reader
                            .read()
                            .then((result) => {
                                return result;
                            });
                    });
            },
            setAudio(word) {
                const URL = this.speechApi + '?word=' + word.en
                if (word.sound === null || word.sound === undefined) {
                    this.fetchAudio(URL)
                    .then((response) => {
                        let blob = new Blob([response.value], {type: 'audio/mp3'});
                        word.sound = window.URL.createObjectURL(blob);
                    });
                }
                this.setPronunciation(word)
            },
            setPronunciation(word) {
                if (word.phonetic === '') {
                    axios
                        .post(this.pronunciationApi, {
                            id: word.id,
                            word: word.en
                        })
                        .then((response) => {
                            word.phonetic = response.data.data.phonetic ? `/${response.data.data.phonetic}/` : ''
                        })
                        .catch((error) => {
                            console.error('phonetic', error);
                        })
                }
            },
            playSound(url) {
                window.audio = new Audio();
                window.audio.src = url;
                window.audio.play();
            }
        }
    }
</script>
<style>
    #cards .card {
        margin: 10px;
        height: 275px;
    }
</style>