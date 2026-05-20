"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const language_1 = require("../utils/language");
Component({
    data: {
        selected: 0,
        activeTheme: 'light',
        items: (0, language_1.getTabBarItems)('en'),
    },
    methods: {
        switchTab(event) {
            const index = Number(event.currentTarget.dataset.index);
            const pagePath = event.currentTarget.dataset.path;
            if (!pagePath || index === this.data.selected)
                return;
            this.setData({ selected: index });
            wx.switchTab({ url: pagePath });
        },
    },
});
