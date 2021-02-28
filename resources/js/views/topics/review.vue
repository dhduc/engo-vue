<template>
    <div id="review" v-loading="loading">
        <el-header>
            <el-button :type="audioPlay ? 'primary' : ''" icon="el-icon-headset" title="Phát âm" @click="audioPlay = !audioPlay">Phát âm</el-button>
            <el-button :type="autoPlay ? 'primary' : ''" icon="el-icon-timer" title="Tự động" @click="autoPlay = !autoPlay">Tự động</el-button>
        </el-header>
        <hr />
        <el-carousel
                v-if="words.length > 0" ref="carousel" indicator-position="outside" :autoplay="autoPlay" arrow="always"
                :interval="5000" trigger="click" height="600" @change="carouselChange"
        >
            <el-carousel-item v-for="word in words" :key="word.id">
                <vue-flip :bindWithMe="flipped" width="100%">
                    <div slot="front">
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span><strong>{{ word.en }}</strong> <em>{{ word.phonetic }}</em></span>
                                <el-button :disabled="word.sound === null" title="Phát âm" type="primary" circle @click="playSound(word.sound)"><i class="fas fa-volume-up"></i></el-button>
                                <el-button title="Xoay" class="right" type="info" icon="el-icon-refresh-right" @click="flipCard()" circle></el-button>
                            </div>
                            <div class="sound">
                                <audio v-show="false" controls style="width: 100%;">
                                    <source :src="word.sound" type="audio/mpeg">
                                </audio>
                            </div>
                            <div class="text-center">
                                <h2>{{ word.en }}</h2>
                                <p class="text-default h2"><em>{{ word.type }}</em> {{ word.definition }}</p>
                                <p class="text-primary h2">{{ word.example }}</p>
                            </div>
                        </el-card>
                    </div>
                    <div slot="back">
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span><strong>{{ word.en }}</strong> <em>{{ word.phonetic }}</em></span>
                                <el-button :disabled="word.sound === null" title="Phát âm" type="primary" circle @click="playSound(word.sound)"><i class="fas fa-volume-up"></i></el-button>
                                <el-button title="Xoay" class="right" type="info" icon="el-icon-refresh-right" @click="flipCard()" circle></el-button>
                            </div>
                            <div class="text-center">
                                <h2>{{ word.vi }}</h2>
                                <p class="text-primary h2">{{ word.example }}</p>
                            </div>
                        </el-card>
                    </div>
                </vue-flip>
            </el-carousel-item>
        </el-carousel>
        <el-row>
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
        </el-row>
        <hr />
        <el-row class="row-footer">
            <span><el-tag effect="dark"><i class="el-icon-back"></i></el-tag> Trước đó</span>
            <el-divider direction="vertical"></el-divider>

            <span><el-tag effect="dark"><i class="el-icon-right"></i></el-tag> Tiếp theo</span>
            <el-divider direction="vertical"></el-divider>

            <span><el-tag effect="dark">Alt</el-tag> Phát âm</span>
            <el-divider direction="vertical"></el-divider>

            <span><el-tag effect="dark">Space</el-tag> Xoay thẻ</span>
        </el-row>
    </div>
</template>

<script>
    import axios from 'axios'
    import VueFlip from 'vue-flip'
    import {DEFINITION, EXAMPLE, FLASH_REPORT_TYPE, ARROW_LEFT_KEY_CODE, ARROW_RIGHT_KEY_CODE, SPACE_KEY_CODE} from '../constants/index'
    import { apiSuccess, apiError } from '../functions/index'

    const SUCCESS_TYPE = 'success'
    const DEFAULT_TYPE = 'default'
    const LIMIT = 100
    const ALT_KEY_CODE = 18

    export default {
        name: 'List',
        components: {
            'vue-flip': VueFlip
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
            },
            reportSubjects: {
                type: String
            },
            reportApi: {
                type: String
            },
            total: {
                type: Number
            }
        },
        data() {
            return {
                loading: false,
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
                flipped: false,
                isShowDialog: false,
                isShowDelete: false,
                isShowReport: false,
                isDisabledDelete: false,
                isDisabledAction: false,
                field: null,
                definition: DEFINITION,
                example: EXAMPLE,
                reportType: FLASH_REPORT_TYPE,
                audioPlay: true,
                autoPlay: false,
                preAudio: null,
            }
        },
        computed: {
        },
        created() {
            this.loadCards()
        },
        mounted: function () {
            this.$nextTick(function () {
                window.addEventListener('keyup', (event) => {
                    if (event.target.localName !== 'body') {
                        //return false
                    }
                    //console.log('event.keyCode', event.keyCode);
                    event.preventDefault();
                    switch(event.keyCode) {
                        case ALT_KEY_CODE:
                            this.playSound(this.word.sound)
                            break;
                        case SPACE_KEY_CODE:
                            this.flipCard()
                            break;
                        case ARROW_LEFT_KEY_CODE:
                            this.$refs.carousel.prev()
                            break;
                        case ARROW_RIGHT_KEY_CODE:
                            this.$refs.carousel.next()
                            break;
                    }
                })
            })
        },
        methods: {
            loadCards() {
                const URL = this.wordsApi + '?offset=' + this.offset + '&limit=' + this.limit
                this.loading = true
                axios
                    .get(URL)
                    .then(response => {
                        this.words = response.data.data.words
                        if (this.words.length !== 0) {
                            const index = 0
                            const word = this.words[index]
                            this.word = word
                            this.wordId = word.id
                            this.audioPlay && this.setAudio(word)
                            this.preLoadAudio(this.words[index + 1])
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        apiError('Không thể lấy danh sách từ vựng')
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            flipCard() {
                this.flipped = !this.flipped
            },
            handleCurrentChange(val) {
                this.offset = (val - 1) * this.limit
                this.loadCards()
            },
            carouselChange(index) {
                const word = this.words[index]
                this.word = word
                this.wordId = word.id
                this.flipped = false
                this.audioPlay && this.setAudio(word)
                this.preLoadAudio(this.words[index + 1])
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
            preLoadAudio(word) {
                if (word.sound === null || word.sound === undefined) {
                    const URL = this.speechApi + '?word=' + word.en
                    this.fetchAudio(URL)
                        .then((response) => {
                            let blob = new Blob([response.value], {type: 'audio/mp3'});
                            this.preAudio = window.URL.createObjectURL(blob);
                        });
                }
            },
            setAudio(word) {
                const URL = this.speechApi + '?word=' + word.en

                if (word.sound === null || word.sound === undefined) {
                    if (this.preAudio) {
                        word.sound = this.preAudio;
                        if (this.audioPlay) {
                            this.playSound(this.preAudio)
                        }
                    } else {
                        this.fetchAudio(URL)
                            .then((response) => {
                                let blob = new Blob([response.value], {type: 'audio/mp3'});
                                let url = window.URL.createObjectURL(blob);
                                word.sound = url;
                                if (this.audioPlay) {
                                    this.playSound(url)
                                }
                            });
                    }
                } else {
                    if (this.audioPlay) {
                        this.playSound(word.sound)
                    }
                }
            },
            playSound(url) {
                window.audio = new Audio();
                window.audio.src = url;
                window.audio.play();
            },
            getRemember(remember) {
                if (remember) {
                    return SUCCESS_TYPE
                }

                return DEFAULT_TYPE
            },
            updateText(id, text) {
                this.isDisabledAction = true
                axios
                    .post(this.updateApi, {
                        id: id,
                        field: 'vi',
                        vi: text
                    })
                    .then(() => {
                        apiSuccess('Cập nhật thành công');
                    })
                    .catch(() => {
                        apiError('Không thể cập nhật')
                    })
                    .finally(() => {
                        this.isDisabledAction = false
                    })
            },
            loadModal(wordId, wordName, field) {
                this.field = field
                this.wordId = wordId
                this.wordName = wordName
                this.isShowDialog = true
            },
            updateWord(data) {
                const index = this.words.findIndex(item => item.id === data.id);
                if (data.field === DEFINITION) {
                    this.words[index].type = data.type
                    this.words[index].definition = data.definition
                }
                if (data.field === EXAMPLE) {
                    this.words[index].example = data.example
                }
            },
            cancelDialog() {
                this.field = null
                this.wordId = null
                this.wordName = null
                this.isShowDialog = false
            },
            showDeleteWord(wordId, wordName) {
                this.wordId = wordId
                this.wordName = wordName
                this.isShowDelete = true
            },
            showReportWord(wordId) {
                this.wordId = wordId
                this.isShowReport = true
            },
            deleteWord() {
                this.isDisabledDelete = true
                axios
                    .post(this.deleteApi, {
                        id: this.wordId,
                        field: 'deleted_at'
                    })
                    .then(() => {
                        const index = this.words.findIndex(item => item.id === this.wordId)
                        this.words.splice(index, 1)
                        apiSuccess('Xóa thành công');
                    })
                    .catch(() => {
                        apiError('Không thể xóa từ vựng')
                    })
                    .finally(() => {
                        this.cancelDeleteWord()
                        this.isDisabledDelete = false
                    })
            },
            cancelDeleteWord() {
                this.wordName = null
                this.isShowDelete = false
            },
            cancelReportWord() {
                this.isShowReport = false
            },
        }
    }
</script>
