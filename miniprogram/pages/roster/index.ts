import {
  addTodo,
  completeTodo,
  deleteTodo,
  updateTodo,
} from '../../utils/gameState';
import { buildThemePageData } from '../../utils/pageData';
import { syncCustomTabBar } from '../../utils/tabBar';
import { getDifficultyLabel, getLanguagePack } from '../../utils/language';
import type { TodoDifficulty } from '../../types';

type Filter = 'all' | 'active' | 'completed';

Page({
  data: {
    ...buildThemePageData(
      getApp<IAppOption>().globalData.themePreference,
      getApp<IAppOption>().globalData.activeTheme,
      getApp<IAppOption>().globalData.statusBarHeight,
      getApp<IAppOption>().globalData.languagePreference,
      getApp<IAppOption>().globalData.activeLanguage,
    ),
    todos: [],
    filter: 'all' as Filter,
    formTitle: '',
    formDifficulty: 'medium' as TodoDifficulty,
    editingId: '',
    dailyDone: 0,
    dailyTotal: 0,
    dailyPercent: 0,
    copy: null,
  },

  onShow() {
    const app = getApp<IAppOption>();
    syncCustomTabBar(this, 2, app.globalData.activeTheme, app.globalData.activeLanguage);
    this.refresh();
  },

  refresh() {
    const app = getApp<IAppOption>();
    const themeData = buildThemePageData(
      app.globalData.themePreference,
      app.globalData.activeTheme,
      app.globalData.statusBarHeight,
      app.globalData.languagePreference,
      app.globalData.activeLanguage,
    );
    const copy = getLanguagePack(app.globalData.activeLanguage);
    const allTodos = app.globalData.gameState.todos;
    const filter = this.data.filter as Filter;
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
        difficultyLabel: getDifficultyLabel(todo.difficulty, app.globalData.activeLanguage),
      })),
      dailyDone,
      dailyTotal: todayTodos.length,
      dailyPercent: todayTodos.length ? Math.round((dailyDone / todayTodos.length) * 100) : 0,
    });
  },

  onTitleInput(event: any) {
    this.setData({ formTitle: event.detail.value });
  },

  setDifficulty(event: any) {
    this.setData({ formDifficulty: event.currentTarget.dataset.difficulty });
  },

  setFilter(event: any) {
    this.setData({ filter: event.currentTarget.dataset.filter });
    this.refresh();
  },

  submitMission() {
    const title = String(this.data.formTitle || '').trim();
    if (!title) {
      wx.showToast({ title: this.data.copy.roster.enterMissionToast, icon: 'none' });
      return;
    }

    const app = getApp<IAppOption>();
    const state = this.data.editingId
      ? updateTodo(app.globalData.gameState, this.data.editingId, title, this.data.formDifficulty)
      : addTodo(app.globalData.gameState, title, this.data.formDifficulty);
    app.updateGameState(state);
    this.setData({ formTitle: '', formDifficulty: 'medium', editingId: '' });
    this.refresh();
  },

  completeMission(event: any) {
    const app = getApp<IAppOption>();
    app.updateGameState(completeTodo(app.globalData.gameState, event.currentTarget.dataset.id));
    this.refresh();
  },

  editMission(event: any) {
    const app = getApp<IAppOption>();
    const todo = app.globalData.gameState.todos.find((item) => item.id === event.currentTarget.dataset.id);
    if (!todo) return;
    this.setData({
      editingId: todo.id,
      formTitle: todo.title,
      formDifficulty: todo.difficulty,
    });
  },

  deleteMission(event: any) {
    const app = getApp<IAppOption>();
    app.updateGameState(deleteTodo(app.globalData.gameState, event.currentTarget.dataset.id));
    this.refresh();
  },
});
