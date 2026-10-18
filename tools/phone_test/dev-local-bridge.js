(function () {
    'use strict';

    if (window.LucioleAndroid) {
        return;
    }

    var BACKUP_PREFIX = 'luciole_phone_backup_slot_';

    window.LucioleAndroid = {
        getPremiumGemBalance: function () {
            return 0;
        },

        requestPremiumGemSpend: function () {
            return '';
        },

        requestGemCatalog: function () {
            return false;
        },

        purchaseGemPack: function () {
            return false;
        },

        isBillingEnabled: function () {
            return false;
        },

        isLocalTestMode: function () {
            return false;
        },

        appVersion: function () {
            return '4.0.0-b133';
        },

        backupSave: function (slot, json) {
            try {
                localStorage.setItem(BACKUP_PREFIX + String(slot), String(json || ''));
                return true;
            }
            catch (error) {
                return false;
            }
        },

        readSaveBackup: function (slot) {
            try {
                return localStorage.getItem(BACKUP_PREFIX + String(slot)) || '';
            }
            catch (error) {
                return '';
            }
        }
    };
}());
