"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = require("../../utils/gameState");
const pageData_1 = require("../../utils/pageData");
const tabBar_1 = require("../../utils/tabBar");
const language_1 = require("../../utils/language");
Page({
    data: {
        ...(0, pageData_1.buildThemePageData)(getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
        todos: [],
        filter: 'all',
        formTitle: '',
        formDifficulty: 'medium',
        editingId: '',
        dailyDone: 0,
        dailyTotal: 0,
        dailyPercent: 0,
        copy: null,
    },
    onShow() {
        const app = getApp();
        (0, tabBar_1.syncCustomTabBar)(this, 2, app.globalData.activeTheme, app.globalData.activeLanguage);
        this.refresh();
    },
    refresh() {
        const app = getApp();
        const themeData = (0, pageData_1.buildThemePageData)(app.globalData.themePreference, app.globalData.activeTheme, app.globalData.statusBarHeight, app.globalData.languagePreference, app.globalData.activeLanguage);
        const copy = (0, language_1.getLanguagePack)(app.globalData.activeLanguage);
        const allTodos = app.globalData.gameState.todos;
        const filter = this.data.filter;
        const todos = filter === 'active'
            ? allTodos.filter((todo) => !todo.completed)
            : filter === 'completed'
                ? allTodos.filter((todo) => todo.completed)
                : allTodos;
        const today = new Date().toISOString().slice(0, 10);
        const todayTodos = allTodos.filter((todo) => todo.createdAt.slice(0, 10) === today);
        const dailyDone = todayTodos.filter((todo) => todo.completed).length;
        this.setData({
            ...themeData,
            copy,
            dailySummaryText: copy.roster.summary(dailyDone, todayTodos.length),
            submitMissionLabel: this.data.editingId ? copy.roster.updateMission : copy.roster.newMission,
            todos: todos.map((todo) => ({
                ...todo,
                difficultyLabel: (0, language_1.getDifficultyLabel)(todo.difficulty, app.globalData.activeLanguage),
            })),
            dailyDone,
            dailyTotal: todayTodos.length,
            dailyPercent: todayTodos.length ? Math.round((dailyDone / todayTodos.length) * 100) : 0,
        });
    },
    onTitleInput(event) {
        this.setData({ formTitle: event.detail.value });
    },
    setDifficulty(event) {
        this.setData({ formDifficulty: event.currentTarget.dataset.difficulty });
    },
    setFilter(event) {
        this.setData({ filter: event.currentTarget.dataset.filter });
        this.refresh();
    },
    submitMission() {
        const title = String(this.data.formTitle || '').trim();
        if (!title) {
            wx.showToast({ title: this.data.copy.roster.enterMissionToast, icon: 'none' });
            return;
        }
        const app = getApp();
        const state = this.data.editingId
            ? (0, gameState_1.updateTodo)(app.globalData.gameState, this.data.editingId, title, this.data.formDifficulty)
            : (0, gameState_1.addTodo)(app.globalData.gameState, title, this.data.formDifficulty);
        app.updateGameState(state);
        this.setData({ formTitle: '', formDifficulty: 'medium', editingId: '' });
        this.refresh();
    },
    completeMission(event) {
        const app = getApp();
        app.updateGameState((0, gameState_1.completeTodo)(app.globalData.gameState, event.currentTarget.dataset.id));
        this.refresh();
    },
    editMission(event) {
        const app = getApp();
        const todo = app.globalData.gameState.todos.find((item) => item.id === event.currentTarget.dataset.id);
        if (!todo)
            return;
        this.setData({
            editingId: todo.id,
            formTitle: todo.title,
            formDifficulty: todo.difficulty,
        });
    },
    deleteMission(event) {
        const app = getApp();
        app.updateGameState((0, gameState_1.deleteTodo)(app.globalData.gameState, event.currentTarget.dataset.id));
        this.refresh();
    },
});
