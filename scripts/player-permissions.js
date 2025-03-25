Hooks.on("getFolderContext", (html, options) => {
    if (!game.user.isGM) return;

    options.push({
        name: game.i18n.localize("PLAYER_FOLDER_PERMISSIONS"),
        icon: '<i class="fas fa-user-lock"></i>',
        callback: li => {
            const folder = game.folders.get(li.data("folderId"));
            new PlayerPermissionConfig(folder).render(true);
        }
    });
});

class PlayerPermissionConfig extends FormApplication {
    constructor(folder, options = {}) {
        super(folder, options);
        this.folder = folder;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("PLAYER_FOLDER_PERMISSIONS"),
            id: "player-permission-config",
            template: "modules/my-player-folder-permissions/templates/player-permission-config.html",
            width: 500,
            height: "auto",
            resizable: true
        });
    }

    getData() {
        let permissions = this.folder.getFlag("my-player-folder-permissions", "playerPermissions") || {};
        return {
            players: game.users.filter(u => !u.isGM).map(user => ({
                id: user.id,
                name: user.name,
                permission: permissions[user.id] || "none"
            })),
            folder: this.folder
        };
    }

    async _updateObject(event, formData) {
        await this.folder.setFlag("my-player-folder-permissions", "playerPermissions", formData.permissions);
        ui.notifications.info(game.i18n.localize("PLAYER_FOLDER_PERMISSIONS") + " gespeichert.");
    }
}

// Sichtbarkeitsprüfung mit Live-Update
Hooks.on("renderSidebarDirectory", (app, html) => {
    if (game.user.isGM) return;

    let folders = game.folders;
    let userId = game.user.id;

    for (let folder of folders) {
        let permissions = folder.getFlag("my-player-folder-permissions", "playerPermissions") || {};
        let userPermissions = permissions[userId];

        if (!userPermissions || userPermissions === "none") {
            html.find(`[data-folder-id="${folder.id}"]`).hide();
        }
    }
});
