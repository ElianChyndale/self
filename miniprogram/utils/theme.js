"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveThemePreference = resolveThemePreference;
exports.normalizeDeviceTheme = normalizeDeviceTheme;
exports.resolveActiveTheme = resolveActiveTheme;
exports.getThemeLabel = getThemeLabel;
exports.detectSystemTheme = detectSystemTheme;
exports.detectStatusBarHeight = detectStatusBarHeight;
exports.applyThemeChrome = applyThemeChrome;
const language_1 = require("./language");
function resolveThemePreference(value) {
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}
function normalizeDeviceTheme(value) {
    return value === 'dark' ? 'dark' : 'light';
}
function resolveActiveTheme(preference, deviceTheme) {
    if (preference === 'light' || preference === 'dark')
        return preference;
    return normalizeDeviceTheme(deviceTheme);
}
function getThemeLabel(theme, language = 'en') {
    return (0, language_1.getThemeLabel)(theme, language);
}
function detectSystemTheme() {
    var _a;
    try {
        const systemInfo = (_a = wx.getSystemInfoSync) === null || _a === void 0 ? void 0 : _a.call(wx);
        return normalizeDeviceTheme(systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.theme);
    }
    catch (error) {
        console.warn('System theme detection failed; defaulting to light mode.', error);
        return 'light';
    }
}
function detectStatusBarHeight() {
    var _a, _b;
    try {
        const windowInfo = (_a = wx.getWindowInfo) === null || _a === void 0 ? void 0 : _a.call(wx);
        if (typeof (windowInfo === null || windowInfo === void 0 ? void 0 : windowInfo.statusBarHeight) === 'number')
            return windowInfo.statusBarHeight;
        const systemInfo = (_b = wx.getSystemInfoSync) === null || _b === void 0 ? void 0 : _b.call(wx);
        if (typeof (systemInfo === null || systemInfo === void 0 ? void 0 : systemInfo.statusBarHeight) === 'number')
            return systemInfo.statusBarHeight;
    }
    catch (error) {
        console.warn('Status bar detection failed; using fallback inset.', error);
    }
    return 24;
}
function applyThemeChrome(activeTheme) {
    if (typeof wx.setNavigationBarColor !== 'function')
        return;
    if (activeTheme === 'dark') {
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#050607',
            animation: { duration: 200, timingFunc: 'easeIn' },
        });
        return;
    }
    wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#e7e1d2',
        animation: { duration: 200, timingFunc: 'easeIn' },
    });
}
