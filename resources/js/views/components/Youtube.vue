<template>
    <el-form-item>
        <el-radio-group id="v-step-2" v-model="form.input">
            <el-radio v-for="(item, i) in form.inputs" :key="i" :label="item.label" @change="changeInput(item.label)">
                {{ item.text }}
            </el-radio>
        </el-radio-group>
    </el-form-item>

    <el-form-item v-if="form.input === form.youtube" class="normal" label="Youtube Video URL">
        <el-input type="url" v-model="form.youtubeURL" class="input-text"></el-input>
        <el-button v-if="form.youtubeURL" type="primary" icon="el-icon-download" @click="getCaption">Get content</el-button>
    </el-form-item>
</template>
