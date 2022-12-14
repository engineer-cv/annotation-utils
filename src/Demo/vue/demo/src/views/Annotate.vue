<template>
    <v-container class="grey lighten-5 pa-0">
        <v-row no-gutters>
            <v-col class="container-wrapper">
                <div class="container" ref="container"></div>
            </v-col>
            <v-col class="pa-4 code-container-wrapper" v-if="this.jsonData !== null">
                <div class="code-container">
                    <code v-html="this.json"></code>
                </div>
            </v-col>
            <v-dialog max-width="290" persistent v-model="showLabelCategoriesDialog">
                <v-card>
                    <v-card-title>
                        <span class="headline">请选择分类</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedLabelCategory">
                            <v-radio :key="category.id"
                                     :label="category.text"
                                     :value="category.id"
                                     v-for="category in this.labelCategories"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="showLabelCategoriesDialog = false" color="primary">
                            取消
                        </v-btn>
                        <v-btn @click="addLabel" color="primary">
                            确定
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog max-width="290" persistent v-model="showConnectionCategoriesDialog">
                <v-card>
                    <v-card-title>
                        <span class="headline">请选择分类</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedConnectionCategory">
                            <v-radio :key="category.id"
                                     :label="category.text"
                                     :value="category.id"
                                     v-for="category in this.connectionCategories"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="showConnectionCategoriesDialog = false" color="primary">
                            取消
                        </v-btn>
                        <v-btn @click="addConnection" color="primary">
                            确定
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script lang="ts">
    import Vue from "vue";
    import Prism from "prismjs";
    import {Action, Annotator} from "wm-annotation-utils";
    import {LabelCategory} from "wm-annotation-utils/dist/Store/LabelCategory";
    import {ConnectionCategory} from "wm-annotation-utils/dist/Store/ConnectionCategory";
    import defaultData from "@/assets/default.json";


    enum CategorySelectMode {
        Create,
        Update
    }

    export default Vue.extend({
        components: {},
        data() {
            return {
                jsonData: defaultData|| null,
                annotator: null as Annotator | null,
                selectedLabelCategory: null as LabelCategory.Entity | null,
                selectedConnectionCategory: null as ConnectionCategory.Entity | null,
                showLabelCategoriesDialog: false as boolean,
                showConnectionCategoriesDialog: false as boolean,
                json: "",
                startIndex: -1,
                endIndex: -1,
                first: -1,
                second: -1,
                categorySelectMode: CategorySelectMode.Create,
                selectedId: -1
            };
        },
        methods: {
            updateJSON(): void {
                this.json = JSON.stringify(this.annotator.store.json, null, 4);
            },
            addLabel(): void {
                if (this.categorySelectMode === CategorySelectMode.Update) {
                    this.annotator.applyAction(Action.Label.Update(this.selectedId, this.selectedLabelCategory));
                } else {
                    this.annotator.applyAction(Action.Label.Create(this.selectedLabelCategory, this.startIndex, this.endIndex));
                }
                this.showLabelCategoriesDialog = false;
                this.updateJSON();
            },
            addConnection(): void {
                if (this.categorySelectMode === CategorySelectMode.Update) {
                    this.annotator.applyAction(Action.Connection.Update(this.selectedId, this.selectedConnectionCategory));
                } else {
                    this.annotator.applyAction(Action.Connection.Create(this.selectedConnectionCategory, this.from, this.to));
                }
                this.showConnectionCategoriesDialog = false;
                this.updateJSON();
            },
            createAnnotator(defaultData:any): Annotator {
                // this.jsonData = defaultData;
                // console.log("this.jsonData",this.jsonData);
                
                const annotator = new Annotator(defaultData, this.$refs.container);

                annotator.on("textSelected", (startIndex, endIndex) => {
                    this.startIndex = startIndex;
                    this.endIndex = endIndex;
                    this.categorySelectMode = CategorySelectMode.Create;
                    this.showLabelCategoriesDialog = true;
                });
                annotator.on("twoLabelsClicked", (fromLabelId, toLabelId) => {
                    this.from = fromLabelId;
                    this.to = toLabelId;
                    this.categorySelectMode = CategorySelectMode.Create;
                    this.showConnectionCategoriesDialog = true;
                });
                annotator.on("labelRightClicked", (labelId, event: MouseEvent) => {
                    if (event.ctrlKey) {
                        this.categorySelectMode = CategorySelectMode.Update;
                        this.selectedId = labelId;
                        this.showLabelCategoriesDialog = true;
                    } else {
                        annotator.applyAction(Action.Label.Delete(labelId));
                    }
                    this.updateJSON();
                });
                annotator.on("connectionRightClicked", (connectionId, event: MouseEvent) => {
                    if (event.ctrlKey) {
                        this.categorySelectMode = CategorySelectMode.Update;
                        this.selectedId = connectionId;
                        this.showConnectionCategoriesDialog = true;
                    } else {
                        annotator.applyAction(Action.Connection.Delete(connectionId));
                    }
                    this.updateJSON();
                });
                annotator.on("contentInput", (position, value) => {
                    annotator.applyAction(Action.Content.Splice(position, 0, value));
                    this.updateJSON();
                });
                annotator.on("contentDelete", (position, length) => {
                    annotator.applyAction(Action.Content.Splice(position, length, ""));
                    this.updateJSON();
                });
                return annotator;
            },
            highlight(code: string): string {
                return Prism.highlight(code, Prism.languages.javascript, "javascript");
            },
        },
        computed: {
            labelCategories(): LabelCategory.Entity[] {
                if (this.annotator === null) {
                    return [];
                }
                const result = [];
                for (const [_, category] of this.annotator.store.labelCategoryRepo) {
                    result.push(category);
                }
                return result;
            },
            connectionCategories(): ConnectionCategory.Entity[] {
                if (this.annotator === null) {
                    return [];
                }
                const result = [];
                for (const [_, category] of this.annotator.store.connectionCategoryRepo) {
                    result.push(category);
                }
                return result;
            }
        },
        mounted(): void {
            if (this.jsonData !== null && this.jsonData.content) {
                this.annotator = this.createAnnotator(defaultData);
                this.updateJSON()
            }
        },
    });
</script>
<style scoped>
    .code-container-wrapper,
    .container-wrapper {
        min-height: calc(100vh - 64px);
        max-height: calc(100vh - 64px);
        overflow: hidden;
        padding: 0 !important;
    }

    .container-wrapper {
        border-right: solid 2px black;
    }

    .code-container-wrapper {
        border-left: solid 2px black;
    }

    .container,
    .code-container {
        padding-top: 10px;
        overflow: scroll;
        height: calc(100vh - 64px);
    }

    code {
        max-width: calc(45vw - 16px);
        background: rgb(32, 32, 32) !important;
        box-shadow: none !important;
        padding: 8px !important;
        padding-right: 40px !important;
        margin-bottom: 20px;
    }
</style>
<style>
    .container > svg {
        width: 45vw;
    }

    .poplar-annotation-label {
        font-size: 14px;
    }

    .poplar-annotation-connection {
        font-family: "PingFang SC", serif;
        font-size: 12px;
    }
</style>
