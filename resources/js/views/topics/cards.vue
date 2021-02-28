<template>
    <div id="cards" v-loading="loading">
        <el-row>
            <div class="header-container text-left my-2 pl-3">
                <input
                    class="form-control"
                    placeholder="Tìm kiếm theo tên hoặc ý nghĩa"
                    prefix-icon="el-icon-search"
                    style="width: 300px; float: left; margin-right: 20px"
                    v-model="search"
                    @keyup.enter="searchWord"
                />
                <button class="btn btn-success" type="button" icon="el-icon-search" @click="searchWord">Tìm kiếm</button>
                <button class="btn btn-primary" type="button" icon="el-icon-s-promotion" @click="showCreateCard">Nhập flashcard</button>
            </div>
        </el-row>
        <hr>
        <el-table v-if="words.length > 0" :data="words" stripe style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <p v-if="scope.row.type" class="text-default">Mô tả: <em>{{ scope.row.type }}</em> {{ scope.row.definition }}</p>
                <p v-if="scope.row.example" class="text-primary">Ví dụ: {{ scope.row.example }}</p>
              </template>
            </el-table-column>
            <el-table-column label="Từ vựng" prop="en">
                <template slot-scope="scope">
                    <span class="h4">{{ scope.row.en }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Ý nghĩa" prop="vi">
                <template slot-scope="scope">
                    <span class="h4">{{ scope.row.vi }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Phiên âm" prop="phonetic">
                <template slot-scope="scope">
                    <em>{{ scope.row.phonetic }}</em>
                </template>
            </el-table-column>
            <el-table-column label="Thao tác" width="300">
                <template slot-scope="scope">
                    <el-button title="Thay đổi" type="primary" icon="el-icon-edit" circle @click="editWord(scope.row)"></el-button>
                        <el-button :disabled="scope.row.sound === null" title="Phát âm" type="primary" circle @click="playSound(scope.row.sound)">
                            <i class="fas fa-volume-up"></i>
                        </el-button>
                        <el-button title="Mô tả" icon="el-icon-question" circle @click="showLoadModal(scope.row, definition)"></el-button>
                        <el-button title="Ví dụ" icon="el-icon-info" circle @click="showLoadModal(scope.row, example)"></el-button>
                        <!--<el-button title="Báo cáo" type="warning" icon="el-icon-s-flag" circle @click="showReportWord(scope.row.id, scope.row.en)"></el-button>-->
                        <el-button title="Xóa" type="danger" icon="el-icon-delete-solid" circle @click="showDeleteWord(scope.row.id, scope.row.en)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row v-else>
            <div class="card shadow m-3 justify-content-center" style="height: 100px">
                <div class="card-body text-center">
                    <span class="text-primary">
                        <i class="ni ni-air-baloon"></i> Chủ đề này chưa có thẻ nào!
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
        <load-modal
          v-if="isShowDialog"
          :word="wordName"
          :word-id="wordId"
          :field="field"
          :visible="isShowDialog"
          :definition-api="definitionApi"
          :example-api="exampleApi"
          :update-api="updateApi"
          :definition="word.definition"
          :example="word.example"
          @updateWord="updateWord"
          @cancelDialog="cancelDialog"
        />
        <import-modal
            v-if="isShowImport"
            :visible="isShowImport"
            :topic-id="topicId"
            :import-api="importApi"
            @loadCards="loadCards"
            @cancelDialog="cancelCreateCard"
        />
        <edit-modal
          v-if="isShowEdit"
          :word="word"
          :word-id="wordId"
          :visible="isShowEdit"
          :update-api="updateApi"
          @saveWord="saveWord"
          @cancelEditDialog="cancelEditDialog"
        />
        <delete-modal
            v-if="isShowDelete"
            :word-name="wordName"
            :is-show-delete="isShowDelete"
            :is-disabled-delete="isDisabledDelete"
            @cancelDeleteWord="cancelDeleteWord"
            @deleteWord="deleteWord"
          />
        <report-modal
            v-if="isShowReport"
            :is-show-report="isShowReport"
            :topic-id="topicId"
            :word-id="wordId"
            :word-name="wordName"
            :report-type="reportType"
            :report-subjects="reportSubjects"
            :report-api="reportApi"
            @cancelReportWord="cancelReportWord"
          />
    </div>
</template>

<script>
    import axios from 'axios'
    import LoadModal from '../components/LoadModal.vue'
    import ImportModal from '../components/ImportModal.vue'
    import EditModal from '../components/EditModal.vue'
    import DeleteModal from '../components/DeleteModal.vue'
    import ReportModal from '../components/ReportModal.vue'
    import {DEFINITION, EXAMPLE, FLASH_REPORT_TYPE, ENTER_KEY_CODE} from '../constants/index'
    import { apiSuccess, apiError } from '../functions/index'
    import { NODE_URL } from '../../env'

    const SUCCESS_TYPE = 'success'
    const DEFAULT_TYPE = 'default'
    const LIMIT = 10

    export default {
        name: 'Cards',
        components: {
            'load-modal': LoadModal,
            'edit-modal': EditModal,
            'import-modal': ImportModal,
            'delete-modal': DeleteModal,
            'report-modal': ReportModal,
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
            },
            reportSubjects: {
                type: String
            },
            reportApi: {
                type: String
            },
            importApi: {
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
                isShowCreate: false,
                isShowEdit: false,
                isShowDialog: false,
                isShowDelete: false,
                isShowReport: false,
                isDisabledDelete: false,
                isDisabledAction: false,
                field: null,
                definition: DEFINITION,
                example: EXAMPLE,
                reportType: FLASH_REPORT_TYPE,
                audioPlay: false,
                translateApi: NODE_URL + '/translate',
                tLoading: false,
                isShowImport: false
            }
        },
        created() {
            this.loadCards()
        },
        mounted: function () {
            this.$nextTick(function () {
                window.addEventListener('keyup', (event) => {
                    if (event.target.localName !== 'body') {
                        return false
                    }
                    if (event.keyCode === ENTER_KEY_CODE) {
                        this.playSound(this.word.sound)
                    }
                })
            })
        },
        methods: {
            showCreateCard() {
                this.isShowImport = true
            },
            cancelCreateCard() {
                this.isShowImport = false
            },
            showTranslate(word, source, target) {
                if (!word.target) {
                    this.tLoading = true
                    axios
                        .post(this.translateApi, {
                            text: word[source]
                        })
                        .then(response => {
                            word[target] = response.data.data.text
                        })
                        .catch(error => {
                            apiError(error.response.data.message)
                        })
                        .finally(() => {
                            this.tLoading = false
                        })
                }
            },
            searchWord() {
                this.offset = 0
                this.loadCards()
            },
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
                const URL = this.speechApi + '?word=' + word.en + '&id=' + word.id;
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
            showLoadModal(word, field) {
                this.field = field
                this.word = word
                this.wordId = word.id
                this.wordName = word.en
                this.isShowDialog = true
            },
            editWord(word) {
                this.wordId = word.id
                this.word = word
                this.isShowEdit = true
            },
            saveWord(data) {
                const index = this.words.findIndex(item => item.id === data.id);
                this.words[index].en = data.en
                this.words[index].vi = data.vi
            },
            createWord() {
                this.cancelCreateCard()
                this.loadCards()
            },
            cancelEditDialog() {
                this.wordId = null
                this.word = null
                this.isShowEdit = false
            },
            updateWord(data) {
                const index = this.words.findIndex(item => item.id === data.id);
                if (data.field === DEFINITION) {
                    this.words[index].type = data.type ? `(${data.type})` : ''
                    this.words[index].definition = data.value
                }
                if (data.field === EXAMPLE) {
                    this.words[index].example = data.value
                }
            },
            cancelDialog() {
                this.field = null
                this.word = null
                this.wordId = null
                this.wordName = null
                this.isShowDialog = false
            },
            showDeleteWord(wordId, wordName) {
                this.wordId = wordId
                this.wordName = wordName
                this.isShowDelete = true
            },
            showReportWord(wordId, wordName) {
                this.wordName = wordName
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
                        this.words = this.words.filter(item => item.id !== this.wordId)
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
                this.wordId = null
                this.isShowDelete = false
            },
            cancelReportWord() {
                this.wordName = null
                this.wordId = null
                this.isShowReport = false
            },
        }
    }
</script>
<style>
    #cards .card {
        margin: 10px;
        height: 275px;
    }
</style>