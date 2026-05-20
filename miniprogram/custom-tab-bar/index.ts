import { getTabBarItems } from '../utils/language';

Component({
  data: {
    selected: 0,
    activeTheme: 'light',
    items: getTabBarItems('en'),
  },

  methods: {
    switchTab(this: any, event: any) {
      const index = Number(event.currentTarget.dataset.index);
      const pagePath = event.currentTarget.dataset.path;
      if (!pagePath || index === this.data.selected) return;

      this.setData({ selected: index });
      wx.switchTab({ url: pagePath });
    },
  },
});
