<template>
    <el-row v-if="words.length > 0">
            <el-col :span="12" v-for="word in words" :key="word.id">
                <el-card class="card">
                    <div class="">
                        <h2 class="h4 text-lg">{{ word.en }} - {{ word.vi }}</h2>
                        <p><em>{{ word.phonetic }}</em></p>
                        <p class="text-primary"><em>{{ word.example }}</em></p>
                        <p>
                            <em>{{ word.type }}</em> {{ word.definition }}
                        </p>
                    </div>
                    <div class="clearfix">
                        <el-button title="Thay đổi" type="primary" icon="el-icon-edit" circle @click="editWord(word)"></el-button>
                        <el-button :disabled="word.sound === null" title="Phát âm" type="primary" circle @click="playSound(word.sound)"><i class="fas fa-volume-up"></i></el-button>
                        <el-button title="Định nghĩa" icon="el-icon-question" circle @click="showLoadModal(word, definition)"></el-button>
                        <el-button title="Ví dụ" icon="el-icon-info" circle @click="showLoadModal(word, example)"></el-button>
                        <!--<el-button title="Báo cáo" type="warning" icon="el-icon-s-flag" circle @click="showReportWord(word.id, word.en)"></el-button>-->
                        <el-button title="Xóa" type="danger" icon="el-icon-delete-solid" circle @click="showDeleteWord(word.id, word.en)"></el-button>
                    </div>
                    <div class="sound">
                        <audio v-show="false" controls style="width: 100%;">
                            <source :src="word.sound" type="audio/mpeg">
                        </audio>
                    </div>
                </el-card>
            </el-col>
        </el-row>
</template>
<script>
    export default {}
</script>