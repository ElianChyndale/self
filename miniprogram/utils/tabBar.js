"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCustomTabBar = syncCustomTabBar;
const language_1 = require("./language");
function syncCustomTabBar(page, selected, activeTheme, activeLanguage) {
    var _a;
    const tabBar = (_a = page === null || page === void 0 ? void 0 : page.getTabBar) === null || _a === void 0 ? void 0 : _a.call(page);
    if (!(tabBar === null || tabBar === void 0 ? void 0 : tabBar.setData))
        return;
    tabBar.setData({
        selected,
        activeTheme,
        items: (0, language_1.getTabBarItems)(activeLanguage),
    });
}
