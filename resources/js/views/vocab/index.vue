<template>
    <div id="cards" v-loading="loading">
        <el-row>
            <div class="header-container text-left my-2 pl-3">
                <input
                    class="form-control"
                    placeholder="Tìm kiếm theo tên"
                    style="width: 300px; float: left; margin-right: 20px"
                    v-model="search"
                    @keyup.enter="searchWord"
                />
                <button class="btn btn-success" type="button" icon="el-icon-search" @click="searchWord">Tìm kiếm</button>
                <a class="btn btn-primary" href="/vocab/export">Quản lý</a>
            </div>
        </el-row>
        <hr>
        <el-table v-if="words.length > 0" :data="words" stripe style="width: 100%">
            <el-table-column label="Từ vựng" prop="en">
                <template slot-scope="scope">
                    <span class="h4" style="text-transform: capitalize;">{{ scope.row.en }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Phiên âm" prop="phonetic">
                <template slot-scope="scope">
                    <em>{{ scope.row.phonetic }}</em>
                </template>
            </el-table-column>
            <el-table-column label="Thao tác" width="300">
                <template slot-scope="scope">
                        <el-button :disabled="scope.row.sound === null" title="Phát âm" type="primary" circle @click="playSound(scope.row.sound)">
                            <i class="fas fa-volume-up"></i>
                        </el-button>
                        <el-button title="Xóa" type="danger" icon="el-icon-delete-solid" circle @click="deleteWord(scope.row.id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row v-else>
            <div class="card shadow m-3 justify-content-center" style="height: 70px">
                <div class="card-body text-center">
                    <span class="text-primary">
                        <i class="ni ni-air-baloon"></i> Chưa có từ vựng nào được lưu!
                    </span>
                </div>
            </div>
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
    import { apiSuccess, apiError } from '../functions/index'
    const LIMIT = 20

    export default {
        name: 'Vocab',
        components: {
        },
        props: {
            vocabApi: {
                type: String
            },
            speechApi: {
                type: String
            },
            pronunciationApi: {
                type: String
            },
            definitionApi: {
                type: String
            },
            exampleApi: {
                type: String
            },
            updateApi: {
                type: String
            },
            deleteApi: {
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
                audioPlay: false
            }
        },
        created() {
            this.loadCards()
        },
        methods: {
            searchWord() {
                this.offset = 0
                this.loadCards()
            },
            loadCards() {
                const URL = this.vocabApi + '?offset=' + this.offset + '&limit=' + this.limit + '&search=' + this.search
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
            },
            deleteWord(wordId) {
                this.isDisabledDelete = true
                axios
                    .post(this.deleteApi, {
                        id: wordId,
                        field: 'deleted_at'
                    })
                    .then(() => {
                        this.words = this.words.filter(item => item.id !== wordId)
                        apiSuccess('Xóa thành công');
                    })
                    .catch(() => {
                        apiError('Không thể xóa từ vựng')
                    })
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